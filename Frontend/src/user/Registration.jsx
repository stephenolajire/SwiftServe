import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Login.module.css";
import Swal from "sweetalert2";
import axios from "axios";
import { Link } from "react-router-dom";
import api from "../constant/api";
import { GlobalContext } from "../constant/GlobalContext";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const {auth} = useContext(GlobalContext)
  const [errors, setErrors] = useState({});
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

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
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Show loading state
      Swal.fire({
        title: "Logging in...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Login request
      const response = await api.post("token/", {
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        Swal.fire({
          title: "Logged In",
          icon: "success",
          text: "Successfully logged in",
          allowOutsideClick: true, // Changed from True to true
        });
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
        navigate("/kyc");
        auth();
      }

      // Save tokens to localStorage

      // Update location if available
      // if (location.latitude && location.longitude) {
      //   await axios.post("/api/update-location/", {
      //     latitude: location.latitude,
      //     longitude: location.longitude,
      //   });
      // }

      // await Swal.fire({
      //   title: "Success!",
      //   text: "Login successful!",
      //   icon: "success",
      //   timer: 1500,
      // });
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        title: "Login Failed",
        text: error.response?.data?.detail || "Invalid credentials",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Welcome Back</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.email ? styles.inputError : ""
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className={styles.errorMessage}>{errors.email}</p>
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.password ? styles.inputError : ""
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className={styles.errorMessage}>{errors.password}</p>
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