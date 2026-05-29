import { asyncHandler } from "../utils/asyncHandler.js";
import * as paymentsService from "../services/payments.service.js";

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const result = await paymentsService.createPaymentIntent(req.body);
  res.status(201).json({
    success: true,
    message: "Payment intent created successfully",
    data: result,
  });
});

export const handlePaymentWebhook = asyncHandler(async (req, res) => {
  const result = await paymentsService.handlePaymentWebhook(req.body);
  res.status(200).json({
    success: true,
    message: "Payment webhook processed successfully",
    data: result,
  });
});

export const getPayments = asyncHandler(async (req, res) => {
  const payments = await paymentsService.getPayments();
  res.status(200).json({
    success: true,
    message: "Payments retrieved successfully",
    data: payments,
  });
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await paymentsService.getPaymentById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Payment details retrieved successfully",
    data: payment,
  });
});

export const refundPayment = asyncHandler(async (req, res) => {
  const payment = await paymentsService.refundPayment(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Payment refunded successfully",
    data: payment,
  });
});

export const getPaymentReports = asyncHandler(async (req, res) => {
  const report = await paymentsService.getPaymentReports();
  res.status(200).json({
    success: true,
    message: "Payment reports retrieved successfully",
    data: report,
  });
});
