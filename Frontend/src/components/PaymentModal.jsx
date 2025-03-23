import React, { useState } from "react";
import styles from "../css/PaymentModal.module.css";
import api from "../constant/api";
import Swal from "sweetalert2";
import { FaSpinner } from "react-icons/fa";

const PaymentModal = ({ delivery, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const response = await api.post(
        `deliveries/${delivery.id}/initiate-payment/`,
        {
          amount: delivery.estimated_price,
        }
      );

      if (response.data.status === "success") {
        // Redirect to Paystack payment page
        window.location.href = response.data.data.payment_url;
      } else {
        throw new Error("Failed to initialize payment");
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to initialize payment",
        icon: "error",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Complete Payment</h2>
        <div className={styles.paymentDetails}>
          <p>
            <strong>Delivery ID:</strong> {delivery.id}
          </p>
          <p>
            <strong>Item:</strong> {delivery.itemName}
          </p>
          <p>
            <strong>Distance Covered:</strong>{" "}
            {delivery.distance_covered?.toFixed(2)} km
          </p>
          <p>
            <strong>Total Amount:</strong> ₦
            {delivery.estimated_price?.toLocaleString()}
          </p>
        </div>
        <div className={styles.buttonGroup}>
          <button
            onClick={handlePayment}
            className={styles.payButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className={styles.spinner} />
                Processing...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </button>
          <button
            onClick={onClose}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
