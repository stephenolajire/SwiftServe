import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../constant/api";
import styles from "../css/ResetPassword.module.css";
import Swal from "sweetalert2";
import { FaLock, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords don't match",
        text: "Please make sure your passwords match",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.put("reset-password/", {
        user_id: location.state?.userId,
        reset_token: location.state?.resetToken,
        new_password: passwords.newPassword,
        confirm_password: passwords.confirmPassword,
      });

      Swal.fire({
        icon: "success",
        title: "Password Reset Successful!",
        text: "You can now login with your new password",
        confirmButtonText: "Login",
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text: error.response?.data?.error || "Failed to reset password",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/verify-password-otp")}
        >
          <FaArrowLeft /> Back
        </button>

        <h1>Reset Password</h1>
        <p className={styles.description}>
          Please enter your new password below.
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.icon} />
              <input
                type={showPassword.new ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                value={passwords.newPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPassword.new ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.icon} />
              <input
                type={showPassword.confirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !passwords.newPassword || !passwords.confirmPassword}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;