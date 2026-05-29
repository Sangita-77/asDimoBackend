import Payment from "../models/payment.model.js";

export const createPaymentIntent = async (data) => {
  const payment = await Payment.create({
    amount: data.amount,
    currency: data.currency || "INR",
    status: "pending",
    metadata: data.metadata || {},
  });
  return {
    clientSecret: `mock_${payment.paymentId}_${Date.now()}`,
    payment,
  };
};

export const handlePaymentWebhook = async (event) => {
  if (event.paymentId && event.status) {
    await Payment.findOneAndUpdate(
      { paymentId: Number(event.paymentId) },
      { status: event.status, metadata: event.metadata || {} },
      { new: true }
    );
  }
  return event;
};

export const getPayments = async () => {
  return await Payment.find();
};

export const getPaymentById = async (id) => {
  const payment = await Payment.findById(id);
  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }
  return payment;
};

export const refundPayment = async (id, data) => {
  const payment = await Payment.findById(id);
  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }
  payment.status = "refunded";
  payment.metadata = { ...payment.metadata, refundReason: data.reason || "refund" };
  await payment.save();
  return payment;
};

export const getPaymentReports = async () => {
  const payments = await Payment.find();
  const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  return {
    totalPayments: payments.length,
    totalAmount,
    breakdown: payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {}),
  };
};