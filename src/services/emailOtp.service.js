import crypto from "crypto";
import validator from "validator";
import { sendEmail } from "../utils/sendEmail.js";

// This store intentionally lives only in the application process. It does not
// read from or write to MongoDB, and is cleared when the server restarts.
const emailOtps = new Map();
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const hashOtp = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const sendEmailOtp = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!validator.isEmail(normalizedEmail)) {
    throw createError("Please provide a valid email address", 400);
  }

  const currentOtp = emailOtps.get(normalizedEmail);
  if (currentOtp && Date.now() - currentOtp.sentAt < RESEND_COOLDOWN_MS) {
    throw createError("Please wait before requesting another OTP", 429);
  }

  const otp = crypto.randomInt(100000, 1000000).toString();

  await sendEmail(
    normalizedEmail,
    "Email verification OTP",
    `
      <h2>Email Verification</h2>
      <p>Your verification OTP is:</p>
      <h1 style="color: #007bff; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you did not request this OTP, please ignore this email.</p>
    `
  );

  emailOtps.set(normalizedEmail, {
    otpHash: hashOtp(otp),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    sentAt: Date.now(),
    attempts: 0,
  });

  return { email: normalizedEmail, expiresInSeconds: OTP_EXPIRY_MS / 1000 };
};

export const validateEmailOtp = (email, otp) => {
  const normalizedEmail = normalizeEmail(email);

  if (!validator.isEmail(normalizedEmail)) {
    throw createError("Please provide a valid email address", 400);
  }

  if (!/^\d{6}$/.test(String(otp || ""))) {
    throw createError("Please provide a valid 6-digit OTP", 400);
  }

  const storedOtp = emailOtps.get(normalizedEmail);
  if (!storedOtp) {
    throw createError("No OTP request found. Please request a new OTP.", 400);
  }

  if (Date.now() > storedOtp.expiresAt) {
    emailOtps.delete(normalizedEmail);
    throw createError("OTP has expired. Please request a new OTP.", 400);
  }

  if (storedOtp.attempts >= MAX_ATTEMPTS) {
    emailOtps.delete(normalizedEmail);
    throw createError("Too many invalid attempts. Please request a new OTP.", 429);
  }

  const providedOtpHash = hashOtp(otp);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(storedOtp.otpHash, "hex"),
    Buffer.from(providedOtpHash, "hex")
  );

  if (!isValid) {
    storedOtp.attempts += 1;
    throw createError("Invalid OTP", 400);
  }

  emailOtps.delete(normalizedEmail);
  return { email: normalizedEmail };
};
