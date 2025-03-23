import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../constant/api";
import Swal from "sweetalert2";

const PaymentCallback = () => {
  const [verifying, setVerifying] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleRateDelivery = async (deliveryId) => {
    const { value: rating } = await Swal.fire({
      title: "Rate Your Delivery Experience",
      input: "select",
      inputOptions: {
        5: "⭐⭐⭐⭐⭐ Excellent",
        4: "⭐⭐⭐⭐ Very Good",
        3: "⭐⭐⭐ Good",
        2: "⭐⭐ Fair",
        1: "⭐ Poor",
      },
      inputPlaceholder: "Select a rating",
      showCancelButton: true,
      confirmButtonText: "Submit Rating",
      cancelButtonText: "Skip",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#6c757d",
    });

    if (rating) {
      try {
        const response = await api.post(`deliveries/${deliveryId}/rate/`, {
          rating: parseInt(rating),
        });

        if (response.data.status === "success") {
          await Swal.fire({
            title: "Thank You!",
            text: "Your rating has been submitted successfully",
            icon: "success",
            confirmButtonColor: "#28a745",
          });
        }
      } catch (error) {
        console.error("Rating error:", error);
      }
    }
  };

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const reference = params.get("reference");

        if (reference) {
          const response = await api.post("payments/verify/", { reference });

          if (response.data.status === "success") {
            await Swal.fire({
              title: "Payment Successful",
              text: "Your payment has been processed successfully",
              icon: "success",
              confirmButtonColor: "#28a745",
            });

            // Show rating dialog after payment success
            const deliveryId = response.data.delivery_id; // Make sure this is returned from backend
            await handleRateDelivery(deliveryId);

            // Navigate to dashboard after rating
            navigate("/client/dashboard");
          } else {
            throw new Error("Payment verification failed");
          }
        }
      } catch (error) {
        await Swal.fire({
          title: "Payment Failed",
          text: error.response?.data?.message || "Failed to verify payment",
          icon: "error",
        });
        navigate("/client/dashboard");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [location, navigate]);

  if (verifying) {
    return (
      <div className="payment-callback">
        <h2>Verifying Payment...</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  return null;
};

export default PaymentCallback;
