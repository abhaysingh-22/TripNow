import { validationResult } from "express-validator";
import paymentService from "../services/payment.service.js";
import Ride from "../models/ride.model.js";
import Payment from "../models/payment.model.js";

const createPaymentOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, amount } = req.body;
  const userId = req.user._id;

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    if (ride.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized access to ride" });
    }

    if (ride.paymentMethod !== "upi") {
      return res.status(404).json({
        error: "Payment order only required for UPI payments",
      });
    }

    const razorpayOrder = await paymentService.createRazorpayOrder(
      amount,
      rideId
    );

    const payment = await paymentService.createPayment({
      rideId,
      userId,
      captainId: ride.captainId,
      paymentMethod: "upi",
      amount,
      razorpayOrderId: razorpayOrder.id,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      paymentId: payment._id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Payment order creation error: ", error);
    res.status(500).json({ error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
    req.body;

  try {
    const isValidSignature = paymentService.verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      return res.status(400).json({ error: "Invalid Payment signature" });
    }

    const payment = await paymentService.updatePaymentStatus(paymentId, {
      razorpayPaymentId,
      razorpaySignature,
      status: "completed",
      completedAt: new Date(),
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment record not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payment verifed successfully",
      payment,
    });
  } catch (error) {
    console.error("Payment verification error: ", error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  createPaymentOrder,
  verifyPayment,
};
