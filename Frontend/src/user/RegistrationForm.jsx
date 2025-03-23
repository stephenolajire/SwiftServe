import React, { useState, useEffect } from "react";
import styles from "../css/RegistrationForm.module.css";
import Swal from "sweetalert2";
import axios from "axios";
import api from "../constant/api";
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(25);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    localGovernment: "",
  });

  // Validation functions
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!regex.test(email)) return "Invalid email format";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Must contain an uppercase letter";
    if (!/[a-z]/.test(password)) return "Must contain a lowercase letter";
    if (!/[0-9]/.test(password)) return "Must contain a number";
    if (!/[^A-Za-z0-9]/.test(password))
      return "Must contain a special character";
    return "";
  };

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        return validateEmail(value);
      case "username":
        return !value
          ? "Username is required"
          : value.length < 4
          ? "Username must be at least 4 characters"
          : "";
      case "password":
        return validatePassword(value);
      case "confirmPassword":
        return !value
          ? "Confirm password is required"
          : value !== formData.password
          ? "Passwords must match"
          : "";
      case "firstName":
      case "lastName":
        return !value ? `${name} is required` : "";
      case "phoneNumber":
        return !value
          ? "Phone number is required"
          : !/^\+?[0-9]{8,15}$/.test(value)
          ? "Invalid phone number"
          : "";
      case "dob":
        if (!value) return "Date of birth is required";
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        return age < 13 ? "Must be at least 13 years old" : "";
      default:
        return !value ? `${name} is required` : "";
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Location handling
  const requestLocation = () => {
    if (isRequestingLocation) return;

    if (!navigator.geolocation) {
      Swal.fire({
        title: "Browser Error",
        text: "Geolocation is not supported by your browser",
        icon: "error",
      });
      return;
    }

    setIsRequestingLocation(true);
    console.log("Requesting location..."); // Debug log

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Location received:", position); // Debug log
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsRequestingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error.code, error.message);
        setIsRequestingLocation(false);

        let errorMessage = "Unable to get your location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Location permission was denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
        }

        Swal.fire({
          title: "Location Error",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK",
        });
      },
      options
    );
  };

  useEffect(() => {
    let mounted = true;

    const getLocation = async () => {
      try {
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported");
        }

        setIsRequestingLocation(true);

        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });

        if (mounted) {
          console.log("Initial location set:", position.coords);
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      } catch (error) {
        console.error("Initial location error:", error);
      } finally {
        if (mounted) {
          setIsRequestingLocation(false);
        }
      }
    };

    getLocation();

    return () => {
      mounted = false;
    };
  }, []);

  const checkLocationPermission = async () => {
    try {
      // Check if the browser supports permissions API
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({
          name: "geolocation",
        });
        console.log("Geolocation permission status:", result.state);

        if (result.state === "denied") {
          Swal.fire({
            title: "Location Access Denied",
            text: "Please enable location access in your browser settings to continue",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Open Settings",
            cancelButtonText: "Cancel",
          }).then((result) => {
            if (result.isConfirmed) {
              // This will open browser settings on most browsers
              window.location.href = "chrome://settings/content/location";
            }
          });
        }
      }
    } catch (error) {
      console.error("Error checking location permission:", error);
    }
  };

  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: "File Too Large",
          text: "Please select an image under 5MB",
          icon: "error",
        });
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Validate current step
  const validateStep = (currentStep) => {
    const newErrors = {};
    let fieldsToValidate = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["email", "username", "password", "confirmPassword"];
        break;
      case 2:
        fieldsToValidate = ["firstName", "lastName", "phoneNumber", "dob"];
        break;
      case 3:
        fieldsToValidate = [
          "address",
          "city",
          "state",
          "postalCode",
          "country",
          "localGovernment",
        ];
        break;
      default:
        break;
    }

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setProgress(progress + 25);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setProgress(progress - 25);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 4 && !profileImage) {
      Swal.fire({
        title: "Profile Image Required",
        text: "Please upload a profile picture to complete registration.",
        icon: "warning",
      });
      return;
    }
    try {
      if (!location.latitude || !location.longitude) {
        Swal.fire({
          title: "Location Required",
          text: "Please allow location access to complete registration.",
          icon: "warning",
        });
        return;
      }

      // Show loading state
      Swal.fire({
        title: "Processing",
        text: "Submitting your registration...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const formDataToSubmit = new FormData();

      // Add form fields except confirmPassword
      Object.keys(formData).forEach((key) => {
        if (key !== "confirmPassword") {
          // Convert date format for DOB
          if (key === "dob") {
            formDataToSubmit.append(
              key,
              new Date(formData[key]).toISOString().split("T")[0]
            );
          } else {
            formDataToSubmit.append(key, formData[key]);
          }
        }
      });

      // Add location data
      formDataToSubmit.append("latitude", location.latitude.toString());
      formDataToSubmit.append("longitude", location.longitude.toString());
      formDataToSubmit.append("user_type", "INDIVIDUAL");

      // Add profile image if exists
      if (profileImage) {
        formDataToSubmit.append("profileImage", profileImage);
      }

      // Debug: Log form data
      console.log("Form Data being sent:");
      for (let pair of formDataToSubmit.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await api.post(
        "register/individual/",
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        await Swal.fire({
          title: "Success!",
          text: "Registration completed successfully!",
          icon: "success",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error.response?.message);
      Swal.fire({
        title: "Registration Failed",
        text:
          error.response?.data?.message ||
          Object.values(error.response?.data || {})
            .flat()
            .join("\n") ||
          "Something went wrong",
        icon: "error",
      });
    }
  };
  return (
    <div className={styles.cont}>
      <div className={styles.formContainer}>
        <h4 className={styles.title}>Create Your Account</h4>

        {/* Progress Bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={styles.progressText}>Step {step} of 4</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Account Details */}
          {step === 1 && (
            <div>
              <h5 className={styles.sectionTitle}>Account Details</h5>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email *</label>
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
                <label className={styles.label}>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.username ? styles.inputError : ""
                  }`}
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className={styles.errorMessage}>{errors.username}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password *</label>
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
              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.confirmPassword ? styles.inputError : "" // Changed from errors.email
                  }`}
                  placeholder="Enter your password again"
                />
                {errors.confirmPassword && ( // Changed from errors.email
                  <p className={styles.errorMessage}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {step === 2 && (
            <div>
              <h2 className={styles.sectionTitle}>Personal Information</h2>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`${styles.input} ${
                      errors.firstName ? styles.inputError : ""
                    }`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className={styles.errorMessage}>{errors.firstName}</p>
                  )}
                </div>

                <div className={styles.formColumn}>
                  <label className={styles.label}>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`${styles.input} ${
                      errors.lastName ? styles.inputError : ""
                    }`}
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <p className={styles.errorMessage}>{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.phoneNumber ? styles.inputError : ""
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phoneNumber && (
                  <p className={styles.errorMessage}>{errors.phoneNumber}</p>
                )}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.dob ? styles.inputError : ""
                  }`}
                />
                {errors.dob && (
                  <p className={styles.errorMessage}>{errors.dob}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Address Information */}
          {step === 3 && (
            <div>
              <h2 className={styles.sectionTitle}>Address Information</h2>
              <div className={styles.formRow}>
                <div className={styles.formColumn}>
                  <label className={styles.label}>Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`${styles.input} ${
                      errors.address ? styles.inputError : ""
                    }`}
                    placeholder="Enter your street address"
                  />
                  {errors.address && (
                    <p className={styles.errorMessage}>{errors.address}</p>
                  )}
                </div>
                <div className={styles.formColumn}>
                  <label className={styles.label}>State/Province *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`${styles.input} ${
                      errors.state ? styles.inputError : ""
                    }`}
                    placeholder="State/Province"
                  />
                  {errors.state && (
                    <p className={styles.errorMessage}>{errors.state}</p>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formColumn}>
                  <label className={styles.label}>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`${styles.input} ${
                      errors.city ? styles.inputError : ""
                    }`}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className={styles.errorMessage}>{errors.city}</p>
                  )}
                </div>

                <div className={styles.formColumn}>
                  <label className={styles.label}>Local Government *</label>
                  <input
                    type="text"
                    name="localGovernment"
                    value={formData.localGovernment}
                    onChange={handleChange}
                    className={`${styles.input} ${
                      errors.state ? styles.inputError : ""
                    }`}
                    placeholder="Local Government"
                  />
                  {errors.state && (
                    <p className={styles.errorMessage}>
                      {errors.localGovernment}
                    </p>
                  )}
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formColumn}>
                  <label className={styles.label}>Postal/Zip Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`${styles.input} ${
                      errors.postalCode ? styles.inputError : ""
                    }`}
                    placeholder="Postal/Zip code"
                  />
                  {errors.postalCode && (
                    <p className={styles.errorMessage}>{errors.postalCode}</p>
                  )}
                </div>

                <div className={styles.formColumn}>
                  <label className={styles.label}>Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`${styles.input} ${
                      errors.country ? styles.inputError : ""
                    }`}
                    placeholder="Country"
                  />
                  {errors.country && (
                    <p className={styles.errorMessage}>{errors.country}</p>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <p className={styles.locationInfo}>
                  Your location:{" "}
                  {location.latitude && location.longitude ? (
                    `${location.latitude.toFixed(
                      6
                    )}, ${location.longitude.toFixed(6)}`
                  ) : (
                    <span style={{ color: "#ff4444" }}>
                      {isRequestingLocation
                        ? "Detecting location..."
                        : "Location not detected"}
                    </span>
                  )}
                  {(!location.latitude || !location.longitude) &&
                    !isRequestingLocation && (
                      <button
                        type="button"
                        onClick={requestLocation}
                        className={styles.buttonSecondary}
                        style={{ marginLeft: "10px", padding: "2px 8px" }}
                      >
                        Retry Location Detection
                      </button>
                    )}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Profile Picture */}
          {step === 4 && (
            <div>
              <h2 className={styles.sectionTitle}>Profile Picture</h2>

              <div className={styles.profileUploadContainer}>
                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className={styles.profilePreview}
                    />
                  </div>
                ) : (
                  <div className={styles.profilePlaceholder}>
                    <span>+</span>
                  </div>
                )}

                <label className={styles.uploadButton}>
                  Choose a Profile Picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                  />
                </label>
                <p className={styles.uploadHint}>
                  Recommended: Square image, at least 200x200 pixels
                </p>
              </div>

              {/* Final location check notification */}
              {!location.latitude && (
                <div className={styles.locationWarning}>
                  <p>
                    <strong>Note:</strong> Location permission is required to
                    complete registration.
                  </p>
                  <button
                    type="button"
                    onClick={requestLocation}
                    className={styles.buttonSecondary}
                    style={{ marginTop: "10px" }}
                    disabled={isRequestingLocation}
                  >
                    {isRequestingLocation
                      ? "Requesting..."
                      : "Grant Location Permission"}
                  </button>
                </div>
              )}

              {/* Review information summary */}
              <div className={styles.reviewContainer}>
                <h3 className={styles.subTitle}>Review Your Information</h3>
                <p className={styles.reviewItem}>
                  <strong>Name:</strong> {formData.firstName}{" "}
                  {formData.lastName}
                </p>
                <p className={styles.reviewItem}>
                  <strong>Email:</strong> {formData.email}
                </p>
                <p className={styles.reviewItem}>
                  <strong>Username:</strong> {formData.username}
                </p>
                <p className={styles.reviewItem}>
                  <strong>Phone:</strong> {formData.phoneNumber}
                </p>
                <p className={styles.reviewItem}>
                  <strong>Address:</strong> {formData.address}, {formData.city},{" "}
                  {formData.state} {formData.postalCode}, {formData.country},{" "}
                  {formData.localGovernment}
                </p>
                <p className={styles.reviewItem}>
                  <strong>Location:</strong>{" "}
                  {location.latitude
                    ? `${location.latitude.toFixed(
                        6
                      )}, ${location.longitude.toFixed(6)}`
                    : "Not detected"}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            className={`${styles.buttonContainer} ${
              step === 1
                ? styles.buttonContainerEnd
                : styles.buttonContainerBetween
            }`}
          >
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className={styles.buttonSecondary}
              >
                Back
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className={styles.buttonPrimary}
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className={styles.buttonPrimary}
                disabled={!location.latitude && !location.longitude}
              >
                Complete Registration
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
