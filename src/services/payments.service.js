import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import { getRazorpayInstance } from "../config/razorpay.js";
import { env } from "../config/env.js";


/**
 * Get the public Razorpay Key ID for client-side checkout
 */
export const getRazorpayKey = () => {
  if (!env.RAZORPAY_KEY_ID) {
    throw new Error("RAZORPAY_KEY_ID is not configured in .env");
  }
  return { key: env.RAZORPAY_KEY_ID };
};

/**
 * Create Razorpay Order and record pending payment in database
 */
export const createRazorpayOrder = async ({
  amount,
  currency = "INR",
  receipt,
  notes = {},
  userId,
  metadata = {},
}) => {
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    const error = new Error("Valid amount is required (greater than 0)");
    error.statusCode = 400;
    throw error;
  }

  const razorpay = getRazorpayInstance();
  const normalizedAmount = Number(amount);
  const amountInPaise = Math.round(normalizedAmount * 100);
  const orderReceipt = receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Create order in Razorpay
  const orderOptions = {
    amount: amountInPaise,
    currency: currency.toUpperCase(),
    receipt: orderReceipt,
    notes: {
      ...notes,
      ...(userId ? { userId: String(userId) } : {}),
    },
  };

  const razorpayOrder = await razorpay.orders.create(orderOptions);

  // Save initial pending payment record in database
  const payment = await Payment.create({
    user: userId || null,
    orderId: razorpayOrder.id,
    receipt: razorpayOrder.receipt,
    amount: normalizedAmount,
    currency: razorpayOrder.currency,
    status: "pending",
    provider: "razorpay",
    notes: razorpayOrder.notes,
    metadata: {
      ...metadata,
      razorpayOrderResponse: razorpayOrder,
    },
  });

  return {
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount, // in paise
    amountInRupees: normalizedAmount,
    currency: razorpayOrder.currency,
    receipt: razorpayOrder.receipt,
    razorpayKeyId: env.RAZORPAY_KEY_ID,
    paymentDbId: payment._id,
    paymentId: payment.paymentId,
  };
};

/**
 * Verify Razorpay payment signature after successful checkout in React
 */
export const verifyRazorpayPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  userId,
}) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    const error = new Error(
      "Missing payment verification parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required."
    );
    error.statusCode = 400;
    throw error;
  }

  if (!env.RAZORPAY_KEY_SECRET) {
    const error = new Error("RAZORPAY_KEY_SECRET is not configured in .env");
    error.statusCode = 500;
    throw error;
  }

  // Create expected signature using HMAC SHA256
  const hmac = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const expectedSignature = hmac.digest("hex");

  // Constant-time comparison to prevent timing attacks
  const isValid =
    expectedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(razorpay_signature, "utf-8")
    );

  if (!isValid) {
    // Record payment failure if payment record exists
    await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        status: "failed",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      }
    );

    const error = new Error("Payment signature verification failed. Invalid transaction.");
    error.statusCode = 400;
    throw error;
  }

  // Update payment record to completed
  let payment = await Payment.findOneAndUpdate(
    { orderId: razorpay_order_id },
    {
      status: "completed",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      ...(userId ? { user: userId } : {}),
    },
    { new: true }
  ).populate("user", "name email phone");

  if (!payment) {
    // If order was created externally or payment record was missing
    payment = await Payment.create({
    user: userId || null,
    orderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    amount: 0,
    currency: "INR",
    status: "completed",
    provider: "razorpay",
    });
  }

  return {
    verified: true,
    payment,
  };
};

/**
 * Handle incoming Razorpay webhooks
 */
// export const handlePaymentWebhook = async (body, signature) => {
//   // If webhook secret configured, verify webhook signature
//   if (env.RAZORPAY_WEBHOOK_SECRET && signature) {
//     const expectedSignature = crypto
//       .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
//       .update(typeof body === "string" ? body : JSON.stringify(body))
//       .digest("hex");

//     if (expectedSignature !== signature) {
//       const error = new Error("Invalid Razorpay webhook signature");
//       error.statusCode = 400;
//       throw error;
//     }
//   }

//   const payload = typeof body === "string" ? JSON.parse(body) : body;
//   const event = payload?.event;
//   const entity = payload?.payload?.payment?.entity || payload?.payload?.order?.entity;

//   if (event === "payment.captured" || event === "order.paid") {
//     const orderId = entity?.order_id || entity?.id;
//     const paymentId = entity?.id;

//     if (orderId) {
//       await Payment.findOneAndUpdate(
//         { orderId },
//         {
//           status: "completed",
//           ...(paymentId ? { razorpayPaymentId: paymentId } : {}),
//           metadata: { webhookEvent: payload },
//         },
//         { new: true }
//       );
//     }
//   } else if (event === "payment.failed") {
//     const orderId = entity?.order_id;
//     if (orderId) {
//       await Payment.findOneAndUpdate(
//         { orderId },
//         {
//           status: "failed",
//           metadata: { webhookEvent: payload, error: entity?.error_description },
//         },
//         { new: true }
//       );
//     }
//   } else if (event === "refund.processed") {
//     const refundEntity = payload?.payload?.refund?.entity;
//     const paymentId = refundEntity?.payment_id;
//     if (paymentId) {
//       await Payment.findOneAndUpdate(
//         { razorpayPaymentId: paymentId },
//         {
//           status: "refunded",
//           refundId: refundEntity?.id,
//           refundAmount: refundEntity?.amount ? refundEntity.amount / 100 : undefined,
//           metadata: { webhookEvent: payload },
//         },
//         { new: true }
//       );
//     }
//   }

//   return { received: true, event };
// };


export const handlePaymentWebhook = async (body, signature) => {
  if (env.RAZORPAY_WEBHOOK_SECRET && signature) {
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(
        typeof body === "string"
          ? body
          : JSON.stringify(body)
      )
      .digest("hex");

    if (expectedSignature !== signature) {
      const error = new Error("Invalid Razorpay webhook signature");
      error.statusCode = 400;
      throw error;
    }
  }

  const payload =
    typeof body === "string"
      ? JSON.parse(body)
      : body;

  const event = payload?.event;

  const paymentEntity =
    payload?.payload?.payment?.entity;

  const orderEntity =
    payload?.payload?.order?.entity;

  if (event === "payment.captured") {
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (orderId) {
      await Payment.findOneAndUpdate(
        { orderId },
        {
          status: "completed",
          ...(paymentId
            ? { razorpayPaymentId: paymentId }
            : {}),
          metadata: {
            webhookEvent: payload,
          },
        },
        { new: true }
      );
    }
  }

  else if (event === "order.paid") {
    const orderId = orderEntity?.id;

    if (orderId) {
      await Payment.findOneAndUpdate(
        { orderId },
        {
          status: "completed",
          metadata: {
            webhookEvent: payload,
          },
        },
        { new: true }
      );
    }
  }

  else if (event === "payment.failed") {
    const orderId = paymentEntity?.order_id;

    if (orderId) {
      await Payment.findOneAndUpdate(
        { orderId },
        {
          status: "failed",
          metadata: {
            webhookEvent: payload,
            error: paymentEntity?.error_description,
          },
        },
        { new: true }
      );
    }
  }

  else if (event === "refund.processed") {
    const refundEntity =
      payload?.payload?.refund?.entity;

    const paymentId = refundEntity?.payment_id;

    if (paymentId) {
      await Payment.findOneAndUpdate(
        { razorpayPaymentId: paymentId },
        {
          status: "refunded",
          refundId: refundEntity?.id,
          refundAmount: refundEntity?.amount
            ? refundEntity.amount / 100
            : undefined,
          metadata: {
            webhookEvent: payload,
          },
        },
        { new: true }
      );
    }
  }

  return {
    received: true,
    event,
  };
};
/**
 * Refund a payment by ID via Razorpay API and DB update
 */
export const refundPayment = async (id, data = {}) => {
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { paymentId: Number(id) };
  let payment = await Payment.findOne(query);

  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  let razorpayRefund = null;

  // Process refund via Razorpay if razorpayPaymentId exists
  if (payment.razorpayPaymentId && env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
    try {
      const razorpay = getRazorpayInstance();
      const refundOptions = {};
      if (data.amount) {
        refundOptions.amount = Math.round(Number(data.amount) * 100);
      }
      if (data.reason) {
        refundOptions.notes = { reason: data.reason };
      }

      razorpayRefund = await razorpay.payments.refund(payment.razorpayPaymentId, refundOptions);
    } catch (err) {
      const error = new Error(err?.error?.description || err.message || "Failed to process Razorpay refund");
      error.statusCode = 400;
      throw error;
    }
  }

  payment.status = "refunded";
  payment.refundId = razorpayRefund?.id || payment.refundId;
  payment.refundReason = data.reason || "refund requested";
  payment.refundAmount = data.amount ? Number(data.amount) : payment.amount;
  payment.metadata = {
    ...payment.metadata,
    refundDetails: razorpayRefund || data,
  };

  await payment.save();
  return payment;
};

/**
 * List all payments with pagination / filtering
 */
export const getPayments = async (filters = {}) => {
  return await Payment.find(filters)
    .populate("user", "name email phone role")
    .sort({ createdAt: -1 });
};

/**
 * Get payment by ID (MongoDB _id or paymentId number or Razorpay orderId)
 */
export const getPaymentById = async (id) => {
  let query;
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    query = { _id: id };
  } else if (!isNaN(id)) {
    query = { paymentId: Number(id) };
  } else {
    query = { $or: [{ orderId: id }, { razorpayPaymentId: id }] };
  }

  const payment = await Payment.findOne(query).populate("user", "name email phone role");
  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }
  return payment;
};

/**
 * Get aggregated payment reports
 */
export const getPaymentReports = async () => {
  const payments = await Payment.find();
  const totalAmount = payments.reduce((sum, payment) => {
    return payment.status === "completed" ? sum + (payment.amount || 0) : sum;
  }, 0);

  return {
    totalPayments: payments.length,
    completedAmount: totalAmount,
    breakdown: payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {}),
  };
};