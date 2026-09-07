import Razorpay from "razorpay";
import { env } from "./env.js";

let razorpayInstance = null;

export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        "Razorpay credentials missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file."
      );
    }

    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID, 
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayInstance;
};
