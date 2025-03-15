import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../constant/api";
import styles from "../css/ForgotPassword.module.css";
import Swal from "sweetalert2";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("forgot-password/", { email });

      if (response.data.user_id) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Password reset instructions have been sent to your email",
          confirmButtonText: "Continue",
        }).then(() => {
          navigate("/verify-reset-otp", {
            state: {
              userId: response.data.user_id,
              email: email,
            },
          });
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.error || "Failed to process request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/login")}
        >
          <FaArrowLeft /> Back to Login
        </button>

        <h1>Forgot Password</h1>
        <p className={styles.description}>
          Enter your email address and we'll send you instructions to reset your
          password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <FaEnvelope className={styles.icon} />
              <input
                type="email"
                placeholder="enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
