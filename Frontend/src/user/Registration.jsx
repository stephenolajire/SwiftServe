import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import styles from "../css/Login.module.css";
import Swal from "sweetalert2";
import axios from "axios";
import { Link } from "react-router-dom";

const Login = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Form validation schema
  const schema = yup.object().shape({
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    password: yup.string().required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Request location
  const requestLocation = () => {
    if (isRequestingLocation) return;

    if (navigator.geolocation) {
      setIsRequestingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsRequestingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsRequestingLocation(false);
          Swal.fire({
            title: "Location Error",
            text: "Unable to get your location. Please try again.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      );
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const updateUserLocation = async (email, locationData) => {
    try {
      await axios.post("api/update-location", {
        email,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Show loading state
      Swal.fire({
        title: "Processing",
        text: "Logging you in...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Login request
      const response = await axios.post("api/token", {
        email: data.email,
        password: data.password,
      });

      // Update location if available
      if (location.latitude && location.longitude) {
        await updateUserLocation(data.email, location);
      }

      // Handle successful login
      if (response.data) {
        Swal.fire({
          title: "Success!",
          text: "Login successful!",
          icon: "success",
          timer: 1500,
        });
        // Add your navigation logic here
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        title: "Login Failed",
        text: error.response?.data?.message || "Invalid credentials",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Welcome Back</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              {...register("email")}
              className={`${styles.input} ${
                errors.email ? styles.inputError : ""
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className={styles.errorMessage}>{errors.email.message}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.passwordHeader}>
              <label className={styles.label}>Password</label>
              <Link to="/forgot-password" className={styles.forgotPassword}>
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              {...register("password")}
              className={`${styles.input} ${
                errors.password ? styles.inputError : ""
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className={styles.errorMessage}>{errors.password.message}</p>
            )}
          </div>

          <button type="submit" className={styles.submitButton}>
            Login
          </button>

          <p className={styles.signupText}>
            Don't have an account?{" "}
            <Link to="/register" className={styles.signupLink}>
              Click here to signup
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
