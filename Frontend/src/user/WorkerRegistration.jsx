import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../constant/api";
import styles from "../css/WorkerRegistration.module.css";
import {
  FaUser,
  FaLock,
  FaAddressCard,
  FaIdCard,
  FaCar,
  FaPhone,
} from "react-icons/fa";

const WorkerRegistration = () => {
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
    vehiclePlateNumber: "",
    vehicleType: "",
    emergencyContact: "",
    vehicleRegistration: null,
    driversLicense: null,
  });

  const tabs = [
    {
      id: "personal",
      label: "Personal Info",
      icon: <FaUser />,
      color: "#4CAF50",
    },
    {
      id: "contact",
      label: "Contact Details",
      icon: <FaPhone />,
      color: "#2196F3",
    },
    {
      id: "address",
      label: "Address",
      icon: <FaAddressCard />,
      color: "#9C27B0",
    },
    {
      id: "documents",
      label: "Documents",
      icon: <FaIdCard />,
      color: "#FF9800",
    },
    {
      id: "vehicle",
      label: "Vehicle Info",
      icon: <FaCar />,
      color: "#795548",
    },
  ];

  const [activeTab, setActiveTab] = useState("personal");
  const [completedTabs, setCompletedTabs] = useState([]);

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

  // Handle document uploads
  const handleDocumentUpload = (docType, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: "File Too Large",
          text: "Please select a file under 5MB",
          icon: "error",
        });
        return;
      }
      setFormData((prev) => ({ ...prev, [docType]: file }));
    }
  };

  // Location handling
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

    // Validate all fields before submission
    const isValid = tabs.every((tab) => validateCurrentTab(tab.id));
    if (!isValid) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fill in all required fields correctly",
        icon: "error",
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

      // Generate username if not provided
      const username =
        formData.username ||
        `${formData.firstName}${formData.lastName}`.toLowerCase();

      // Add all form fields
      const fieldsToSubmit = {
        ...formData,
        username,
        user_type: "WORKER",
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
      };

      // Remove confirmPassword from submission
      delete fieldsToSubmit.confirmPassword;

      // Append all fields to FormData
      Object.keys(fieldsToSubmit).forEach((key) => {
        if (
          key !== "vehicleRegistration" &&
          key !== "driversLicense" &&
          key !== "profileImage"
        ) {
          if (key === "dob") {
            formDataToSubmit.append(
              key,
              new Date(fieldsToSubmit[key]).toISOString().split("T")[0]
            );
          } else {
            formDataToSubmit.append(key, fieldsToSubmit[key]);
          }
        }
      });

      // Add files if they exist
      if (profileImage) {
        formDataToSubmit.append("profileImage", profileImage);
      }
      if (formData.vehicleRegistration) {
        formDataToSubmit.append(
          "vehicleRegistration",
          formData.vehicleRegistration
        );
      }
      if (formData.driversLicense) {
        formDataToSubmit.append("driversLicense", formData.driversLicense);
      }

      const response = await api.post("register/worker/", formDataToSubmit, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        await Swal.fire({
          title: "Success!",
          text: "Registration completed successfully!",
          icon: "success",
        });
        navigate("/company/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);

      // Better error handling
      const errorMessage = error.response?.data?.errors
        ? Object.entries(error.response.data.errors)
            .map(([key, value]) => `${key}: ${value.join(", ")}`)
            .join("\n")
        : error.response?.data?.message ||
          "Registration failed. Please try again.";

      Swal.fire({
        title: "Registration Failed",
        text: errorMessage,
        icon: "error",
      });
    }
  };

  const handleTabChange = (direction) => {
    // Find current tab index
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);

    if (direction === "next") {
      // Validate current tab before proceeding
      const isValid = validateCurrentTab(activeTab);
      if (!isValid) return;

      // If validation passes, move to next tab
      if (currentIndex < tabs.length - 1) {
        const nextTab = tabs[currentIndex + 1].id;
        setActiveTab(nextTab);
        // Add current tab to completed tabs if not already included
        if (!completedTabs.includes(activeTab)) {
          setCompletedTabs([...completedTabs, activeTab]);
        }
      }
    } else if (direction === "prev") {
      // Move to previous tab if not on first tab
      if (currentIndex > 0) {
        const prevTab = tabs[currentIndex - 1].id;
        setActiveTab(prevTab);
      }
    }
  };

  const validateCurrentTab = (tabId) => {
    let fieldsToValidate = [];

    switch (tabId) {
      case "personal":
        fieldsToValidate = [
          "firstName",
          "lastName",
          "dob",
          "email",
          "username",
        ];
        break;
      case "contact":
        fieldsToValidate = ["password", "confirmPassword", "phoneNumber"];
        break;
      case "address":
        fieldsToValidate = [
          "address",
          "city",
          "state",
          "postalCode",
          "country",
          "localGovernment",
        ];
        break;
      case "documents":
        // Add document validation if needed
        return true;
      case "vehicle":
        fieldsToValidate = ["vehicleType", "vehiclePlateNumber"];
        break;
      default:
        return true;
    }

    const newErrors = {};
    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <div className={styles.tabContent}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className={errors.firstName ? styles.error : ""}
                />
                {errors.firstName && (
                  <span className={styles.errorText}>{errors.firstName}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className={errors.lastName ? styles.error : ""}
                />
                {errors.lastName && (
                  <span className={styles.errorText}>{errors.lastName}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  placeholder="Date of Birth"
                  className={errors.dob ? styles.error : ""}
                />
                {errors.dob && (
                  <span className={styles.errorText}>{errors.dob}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={errors.email ? styles.error : ""}
                />
                {errors.email && (
                  <span className={styles.errorText}>{errors.email}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className={errors.username ? styles.error : ""}
                />
                {errors.username && (
                  <span className={styles.errorText}>{errors.username}</span>
                )}
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className={styles.tabContent}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={errors.password ? styles.error : ""}
                />
                {errors.password && (
                  <span className={styles.errorText}>{errors.password}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className={errors.confirmPassword ? styles.error : ""}
                />
                {errors.confirmPassword && (
                  <span className={styles.errorText}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className={errors.phoneNumber ? styles.error : ""}
                />
                {errors.phoneNumber && (
                  <span className={styles.errorText}>{errors.phoneNumber}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Emergency Contact"
                  className={errors.emergencyContact ? styles.error : ""}
                />
                {errors.emergencyContact && (
                  <span className={styles.errorText}>
                    {errors.emergencyContact}
                  </span>
                )}
              </div>
            </div>
          </div>
        );

      case "address":
        return (
          <div className={styles.tabContent}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street Address"
                  className={errors.address ? styles.error : ""}
                />
                {errors.address && (
                  <span className={styles.errorText}>{errors.address}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={errors.city ? styles.error : ""}
                />
                {errors.city && (
                  <span className={styles.errorText}>{errors.city}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className={errors.state ? styles.error : ""}
                />
                {errors.state && (
                  <span className={styles.errorText}>{errors.state}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Postal Code"
                  className={errors.postalCode ? styles.error : ""}
                />
                {errors.postalCode && (
                  <span className={styles.errorText}>{errors.postalCode}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className={errors.country ? styles.error : ""}
                />
                {errors.country && (
                  <span className={styles.errorText}>{errors.country}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="localGovernment"
                  value={formData.localGovernment}
                  onChange={handleChange}
                  placeholder="Local Government Area"
                  className={errors.localGovernment ? styles.error : ""}
                />
                {errors.localGovernment && (
                  <span className={styles.errorText}>
                    {errors.localGovernment}
                  </span>
                )}
              </div>
            </div>
          </div>
        );

      case "documents":
        return (
          <div className={styles.tabContent}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <div className={styles.imageUpload}>
                  <label>Profile Image</label>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className={styles.imagePreview}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.locationStatus}>
                  <label>Location Status</label>
                  <p>
                    {location.latitude && location.longitude
                      ? "Location detected"
                      : "Detecting location..."}
                  </p>
                  {(!location.latitude || !location.longitude) && (
                    <button
                      type="button"
                      onClick={requestLocation}
                      className={styles.locationButton}
                      disabled={isRequestingLocation}
                    >
                      {isRequestingLocation
                        ? "Requesting..."
                        : "Request Location Access"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "vehicle":
        return (
          <div className={styles.tabContent}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className={errors.vehicleType ? styles.error : ""}
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
                {errors.vehicleType && (
                  <span className={styles.errorText}>{errors.vehicleType}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="vehiclePlateNumber"
                  value={formData.vehiclePlateNumber}
                  onChange={handleChange}
                  placeholder="Vehicle Plate Number"
                  className={errors.vehiclePlateNumber ? styles.error : ""}
                />
                {errors.vehiclePlateNumber && (
                  <span className={styles.errorText}>
                    {errors.vehiclePlateNumber}
                  </span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Vehicle Registration Document</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleDocumentUpload("vehicleRegistration", e)
                  }
                  className={styles.fileInput}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Driver's License</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload("driversLicense", e)}
                  className={styles.fileInput}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Worker Registration</h1>
          <p>Join our delivery network</p>
        </div>

        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`${styles.tab} ${
                activeTab === tab.id ? styles.active : ""
              } 
                ${completedTabs.includes(tab.id) ? styles.completed : ""}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ "--tab-color": tab.color }}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.content}>{renderTabContent()}</div>

        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            onClick={() => handleTabChange("prev")}
            disabled={tabs[0].id === activeTab}
          >
            Previous
          </button>
          <button
            className={styles.primaryButton}
            onClick={
              activeTab === tabs[tabs.length - 1].id
                ? handleSubmit
                : () => handleTabChange("next")
            }
          >
            {activeTab === tabs[tabs.length - 1].id
              ? "Complete Registration"
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerRegistration;
