import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { createPayment } from "../../../Backend/services/payment.service";

function PaymentGateway({ rideData, onPaymentSuccess, onPaymentCancel }) {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentOder, setPaymentOrder] = useState(null);

  useEffect(() => {
    createPaymentOrder();
  }, []);

  const createPaymentOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rideId: rideData._id,
            amount: rideData.amount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment order");
      }

      setPaymentOrder(data);
      setIsLoading(false);

      initializeRazorpay(data);
    } catch (error) {
      console.error("Payment order creation failed: ", error);
      toast.error("Failed to initialize payment");
      onPaymentCancel();
    }
  };

  const initializeRazorpay = (orderData) => {
    const options = {
      key: orderData.key,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: "TripNow",
      description: `Payment for ride to ${
        rideData.destination?.address || "destination"
      }`,
      order_id: orderData.order.id,
      handler: async (response) => {
        await verifyPayment(response, orderData, orderData.paymentId);
      },
      prefill: {
        name: rideData.user?.name || "User",
        email: rideData.user?.email || "jhonnypins@gamil.com",
        contact: rideData.user?.phone || "XXXX",
      },
      theme: {
        color: "#000000",
      },
      modal: {
        ondismiss: () => {
          onPaymentCancel();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const verifyPayment = async (response, paymentId) => {
    try {
      const token = localStorage.getItem("token");
      const verifyResponse = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/payments/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        }
      );

      const data = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(data.error || "Payment verification failed");
      }

      toast.success("Payment completed successfully!");
      onPaymentSuccess(data.payment);
    } catch (error) {
      console.error("Payment verification failed: ", error);
      toast.error("Payment verification failed");
      onPaymentCancel();
    }
  };

  if (isLoading) {
    return (
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <h3 className="text-lg font-bold mb-2">Initializing Payment</h3>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </motion.div>
    );
  }

  return null;
}

export default PaymentGateway;
