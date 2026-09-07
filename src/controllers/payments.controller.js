import { asyncHandler } from "../utils/asyncHandler.js";
import * as paymentsService from "../services/payments.service.js";

/**
 * GET /api/payments/key
 * Get Razorpay Public Key ID
 */
export const getRazorpayKey = asyncHandler(async (req, res) => {
  const result = paymentsService.getRazorpayKey();
  res.status(200).json({
    success: true,
    message: "Razorpay key retrieved successfully",
    data: result,
  });
});

/**
 * POST /api/payments/create-order
 * Create a new Razorpay order
 */
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency, receipt, notes, metadata } = req.body;
  const userId = req.user?._id || req.user?.id || req.body.userId;

  const result = await paymentsService.createRazorpayOrder({
    amount,
    currency,
    receipt,
    notes,
    userId,
    metadata,
  });

  res.status(201).json({
    success: true,
    message: "Razorpay order created successfully",
    data: result,
  });
});

/**
 * POST /api/payments/verify-payment
 * Verify Razorpay payment signature
 */
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.user?._id || req.user?.id || req.body.userId;

  const result = await paymentsService.verifyRazorpayPayment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
  });

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    data: result,
  });
});

/**
 * POST /api/payments/webhook
 * Handle Razorpay Webhooks
 */
export const handlePaymentWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const result = await paymentsService.handlePaymentWebhook(req.body, signature);

  res.status(200).json({
    success: true,
    message: "Payment webhook processed successfully",
    data: result,
  });
});

/**
 * GET /api/payments
 * Get list of payments
 */
export const getPayments = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.userId) filters.user = req.query.userId;

  const payments = await paymentsService.getPayments(filters);
  res.status(200).json({
    success: true,
    message: "Payments retrieved successfully",
    data: payments,
  });
});

/**
 * GET /api/payments/:id
 * Get single payment by ID
 */
export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await paymentsService.getPaymentById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Payment details retrieved successfully",
    data: payment,
  });
});

/**
 * POST /api/payments/refund/:id
 * Refund payment
 */
export const refundPayment = asyncHandler(async (req, res) => {
  const payment = await paymentsService.refundPayment(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Payment refunded successfully",
    data: payment,
  });
});

/**
 * GET /api/payments/reports
 * Aggregated payment metrics
 */
export const getPaymentReports = asyncHandler(async (req, res) => {
  const report = await paymentsService.getPaymentReports();
  res.status(200).json({
    success: true,
    message: "Payment reports retrieved successfully",
    data: report,
  });
});
