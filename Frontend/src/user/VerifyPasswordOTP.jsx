import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../constant/api";
import styles from "../css/VerifyPasswordOTP.module.css";
import Swal from "sweetalert2";
import { FaKey, FaArrowLeft } from "react-icons/fa";

const VerifyPasswordOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if no userId in state
  useEffect(() => {
    if (!location.state?.userId) {
      navigate("/forgot-password");
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("verify-reset-otp/", {
        user_id: location.state.userId,
        otp: otp,
      });

      if (response.data.reset_token) {
        Swal.fire({
          icon: "success",
          title: "OTP Verified!",
          text: "You can now reset your password",
          confirmButtonText: "Continue",
        }).then(() => {
          navigate("/reset-password", {
            state: {
              userId: location.state.userId,
              resetToken: response.data.reset_token,
              email: location.state.email,
            },
          });
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: error.response?.data?.error || "Invalid or expired OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/forgot-password")}
        >
          <FaArrowLeft /> Back
        </button>

        <h1>Verify OTP</h1>
        <p className={styles.description}>
          Enter the 6-digit code sent to your email address.
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <FaKey className={styles.icon} />
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOTPChange}
                maxLength={6}
                required
                pattern="\d{6}"
                title="Please enter a valid 6-digit OTP"
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p className={styles.resendText}>
          Didn't receive the code?{" "}
          <button
            className={styles.resendButton}
            onClick={() => navigate("/forgot-password")}
          >
            Request again
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyPasswordOTP;
