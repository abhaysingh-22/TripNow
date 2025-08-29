import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/payment.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (amount, rideId) => {
  try {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `rideId_${rideId}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(`Razorpay order creation failed: ${error.message}`);
  }
};

export const verifyRazorpaySignature = (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === razorpaySignature;
};

export const createPayment = async (paymentData) => {
  return await Payment.create(paymentData);
};

export const updatePaymentStatus = async (paymentId, updateData) => {
  return await Payment.findByIdAndUpdate(paymentId, updateData, { new: true });
};

export default {
  createRazorpayOrder,
  verifyRazorpaySignature,
  createPayment,
  updatePaymentStatus,
};
