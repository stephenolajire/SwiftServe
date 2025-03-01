import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import styles from "../css/RegistrationForm.module.css";
import Swal from "sweetalert2";
import axios from "axios";

const RegistrationForm = () => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(25);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationAttempts, setLocationAttempts] = useState(0);

  // Form validation schema
  const schema = yup.object().shape({
    // Account credentials
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    username: yup
      .string()
      .min(4, "Username must be at least 4 characters")
      .required("Username is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      )
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),

    // Personal info
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    phoneNumber: yup
      .string()
      .matches(/^\+?[0-9]{8,15}$/, "Phone number must be valid (8-15 digits)")
      .required("Phone number is required"),
    dob: yup
      .date()
      .max(
        new Date(new Date().setFullYear(new Date().getFullYear() - 13)),
        "You must be at least 13 years old"
      )
      .required("Date of birth is required"),

    // Address
    address: yup.string().required("Address is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    postalCode: yup.string().required("Postal code is required"),
    country: yup.string().required("Country is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  // Request user's geolocation with improved handling
  const requestLocation = () => {
    if (isRequestingLocation) return; // Prevent multiple simultaneous requests

    if (navigator.geolocation) {
      setIsRequestingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsRequestingLocation(false);
          // Clear the location attempts counter once successful
          setLocationAttempts(0);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsRequestingLocation(false);

          // Increment attempts counter
          setLocationAttempts((prev) => prev + 1);

          // Show alert only on first attempt or every third attempt to avoid spamming
          if (locationAttempts === 0 || locationAttempts % 3 === 0) {
            // Show different message based on error type
            if (error.code === error.PERMISSION_DENIED) {
              Swal.fire({
                title: "Location Access Required",
                text: "Please enable location access in your browser settings and try again.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Try Again",
                cancelButtonText: "Continue Without Location",
              }).then((result) => {
                if (result.isConfirmed) {
                  // Try requesting permission again
                  requestLocation();
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                  // Allow user to continue without location, but warn them
                  Swal.fire({
                    title: "Proceeding Without Location",
                    text: "You can continue registration, but location will be required before final submission.",
                    icon: "info",
                    confirmButtonText: "OK",
                  });
                }
              });
            } else {
              // Handle other geolocation errors
              Swal.fire({
                title: "Location Error",
                text: "There was a problem getting your location. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
              });
            }
          }
        },
        // Add options for better geolocation performance
        {
          enableHighAccuracy: true, // Set to false for faster response
          timeout: 10000, // 10 seconds timeout
          maximumAge: 0, // Accept cached positions up to 5 minutes old
        }
      );
    } else {
      Swal.fire({
        title: "Geolocation Not Supported",
        text: "Your browser does not support geolocation. Please use a different browser.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Get user's geolocation on component mount
  useEffect(() => {
    requestLocation();
  }, []);

  // Handle profile picture upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert profile image to base64 for API submission
  const getBase64FromFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Separate API call function
  const submitRegistration = async (formData) => {
    try {
      const response = await axios.post("api/registration", formData);
      if (response.status === 200 || response.status === 201) {
        return response.data;
      }
      throw new Error("Registration failed");
    } catch (error) {
      throw error;
    }
  };

  // Form submission handler
  const onSubmit = async (data) => {
    // Only process submission on step 4
    if (step !== 4) {
      return;
    }

    try {
      // Validate all fields
      const isAllValid = await trigger();

      if (!isAllValid) {
        Swal.fire({
          title: "Incomplete Form",
          text: "Please fill in all required fields before submitting.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      // Check location
      if (!location.latitude || !location.longitude) {
        Swal.fire({
          title: "Location Required",
          text: "Please allow location access to complete registration.",
          icon: "warning",
          confirmButtonText: "Grant Permission",
        }).then(() => {
          requestLocation();
        });
        return;
      }

      // Show loading state
      Swal.fire({
        title: "Processing",
        text: "Submitting your registration...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Prepare form data
      let formData = {
        ...data,
        currentLatitude: location.latitude,
        currentLongitude: location.longitude,
      };

      // Add profile picture if available
      if (profileImage) {
        const base64Image = await getBase64FromFile(profileImage);
        formData.profilePicture = base64Image;
      }

      // Submit registration
      await submitRegistration(formData);

      // Show success message
      Swal.fire({
        title: "Success!",
        text: "Your registration was completed successfully!",
        icon: "success",
        confirmButtonText: "Continue",
      });

      // Reset form
      reset();
      setStep(1);
      setProgress(25);
      setProfileImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        title: "Registration Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  };

  // Modify nextStep to prevent accidental submission
  const nextStep = async () => {
    let fieldsToValidate = [];

    switch (step) {
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
        ];
        break;
      default:
        break;
    }

    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setStep(step + 1);
      setProgress(progress + 25);
    }
  };

  // Go back to previous step
  const prevStep = () => {
    setStep(step - 1);
    setProgress(progress - 25);
  };

  return (
    <div className={styles.cont}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Create Your Account</h1>

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

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Account Details */}
          {step === 1 && (
            <div>
              <h2 className={styles.sectionTitle}>Account Details</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email *</label>
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
                <label className={styles.label}>Username *</label>
                <input
                  type="text"
                  {...register("username")}
                  className={`${styles.input} ${
                    errors.username ? styles.inputError : ""
                  }`}
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className={styles.errorMessage}>
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password *</label>
                <input
                  type="password"
                  {...register("password")}
                  className={`${styles.input} ${
                    errors.password ? styles.inputError : ""
                  }`}
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p className={styles.errorMessage}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password *</label>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className={`${styles.input} ${
                    errors.confirmPassword ? styles.inputError : ""
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className={styles.errorMessage}>
                    {errors.confirmPassword.message}
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
                <div className={styles.formColumn}>
                  <label className={styles.label}>First Name *</label>
                  <input
                    type="text"
                    {...register("firstName")}
                    className={`${styles.input} ${
                      errors.firstName ? styles.inputError : ""
                    }`}
                    placeholder="First name"
                  />
                  {errors.firstName && (
                    <p className={styles.errorMessage}>
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className={styles.formColumn}>
                  <label className={styles.label}>Last Name *</label>
                  <input
                    type="text"
                    {...register("lastName")}
                    className={`${styles.input} ${
                      errors.lastName ? styles.inputError : ""
                    }`}
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <p className={styles.errorMessage}>
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number *</label>
                <input
                  type="tel"
                  {...register("phoneNumber")}
                  className={`${styles.input} ${
                    errors.phoneNumber ? styles.inputError : ""
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phoneNumber && (
                  <p className={styles.errorMessage}>
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth *</label>
                <input
                  type="date"
                  {...register("dob")}
                  className={`${styles.input} ${
                    errors.dob ? styles.inputError : ""
                  }`}
                />
                {errors.dob && (
                  <p className={styles.errorMessage}>{errors.dob.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Address Information */}
          {step === 3 && (
            <div>
              <h2 className={styles.sectionTitle}>Address Information</h2>

              <div className={styles.formGroup}>
                <label className={styles.label}>Address *</label>
                <input
                  type="text"
                  {...register("address")}
                  className={`${styles.input} ${
                    errors.address ? styles.inputError : ""
                  }`}
                  placeholder="Enter your street address"
                />
                {errors.address && (
                  <p className={styles.errorMessage}>
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formColumn}>
                  <label className={styles.label}>City *</label>
                  <input
                    type="text"
                    {...register("city")}
                    className={`${styles.input} ${
                      errors.city ? styles.inputError : ""
                    }`}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className={styles.errorMessage}>{errors.city.message}</p>
                  )}
                </div>

                <div className={styles.formColumn}>
                  <label className={styles.label}>State/Province *</label>
                  <input
                    type="text"
                    {...register("state")}
                    className={`${styles.input} ${
                      errors.state ? styles.inputError : ""
                    }`}
                    placeholder="State/Province"
                  />
                  {errors.state && (
                    <p className={styles.errorMessage}>
                      {errors.state.message}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formColumn}>
                  <label className={styles.label}>Postal/Zip Code *</label>
                  <input
                    type="text"
                    {...register("postalCode")}
                    className={`${styles.input} ${
                      errors.postalCode ? styles.inputError : ""
                    }`}
                    placeholder="Postal/Zip code"
                  />
                  {errors.postalCode && (
                    <p className={styles.errorMessage}>
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>

                <div className={styles.formColumn}>
                  <label className={styles.label}>Country *</label>
                  <input
                    type="text"
                    {...register("country")}
                    className={`${styles.input} ${
                      errors.country ? styles.inputError : ""
                    }`}
                    placeholder="Country"
                  />
                  {errors.country && (
                    <p className={styles.errorMessage}>
                      {errors.country.message}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <p className={styles.locationInfo}>
                  Your location:{" "}
                  {location.latitude
                    ? `${location.latitude.toFixed(
                        6
                      )}, ${location.longitude.toFixed(6)}`
                    : "Waiting for location permission..."}
                  {!location.latitude && !isRequestingLocation && (
                    <button
                      type="button"
                      onClick={requestLocation}
                      className={styles.buttonSecondary}
                      style={{ marginLeft: "10px", padding: "2px 8px" }}
                      disabled={isRequestingLocation}
                    >
                      {isRequestingLocation ? "Requesting..." : "Grant Access"}
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
                  <strong>Name:</strong> {watch("firstName")}{" "}
                  {watch("lastName")}
                </p>
                <p className={styles.reviewItem}>
                  <strong>Email:</strong> {watch("email")}
                </p>
                <p className={styles.reviewItem}>
                  <strong>Username:</strong> {watch("username")}
                </p>
                <p className={styles.reviewItem}>
                  <strong>Phone:</strong> {watch("phoneNumber")}
                </p>
                <p className={styles.reviewItem}>
                  <strong>Address:</strong> {watch("address")}, {watch("city")},{" "}
                  {watch("state")} {watch("postalCode")}, {watch("country")}
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
