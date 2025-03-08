import React, { useState, useEffect } from "react";
import {
  FaBox,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";
import styles from "../css/DeliveryForm.module.css";
import Swal from "sweetalert2";

const DeliveryForm = ({ onSubmit, onClose }) => {
  const initialState = {
    itemName: "",
    itemDescription: "",
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    category: "",
    fragile: false,
    specialInstructions: "",
    pickupAddress: "",
    pickupCity: "",
    pickupState: "",
    pickupDate: "",
    pickupTime: "",
    pickupContactName: "",
    pickupContactPhone: "",
    pickupInstructions: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    recipientName: "",
    recipientPhone: "",
    recipientEmail: "",
    deliveryInstructions: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "itemName":
        if (!value.trim()) error = "Item name is required";
        else if (value.length < 3)
          error = "Item name must be at least 3 characters";
        break;

      case "itemDescription":
        if (!value.trim()) error = "Description is required";
        else if (value.length < 10)
          error = "Please provide a more detailed description";
        break;

      case "weight":
        if (!value) error = "Weight is required";
        else if (isNaN(value) || value <= 0)
          error = "Please enter a valid weight";
        break;

      case "category":
        if (!value) error = "Please select a category";
        break;

      case "pickupAddress":
      case "deliveryAddress":
        if (!value.trim()) error = "Address is required";
        break;

      case "pickupCity":
      case "deliveryCity":
        if (!value.trim()) error = "City is required";
        break;

      case "pickupState":
      case "deliveryState":
        if (!value.trim()) error = "State is required";
        break;

      case "pickupDate":
        if (!value) {
          error = "Pickup date is required";
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) error = "Pickup date cannot be in the past";
        }
        break;

      case "pickupTime":
        if (!value) error = "Pickup time is required";
        break;

      case "pickupContactName":
      case "recipientName":
        if (!value.trim()) error = "Name is required";
        else if (value.length < 2) error = "Name must be at least 2 characters";
        break;

      case "pickupContactPhone":
      case "recipientPhone":
        if (!value.trim()) {
          error = "Phone number is required";
        } else if (!/^\+?[0-9]{10,15}$/.test(value.replace(/[\s-]/g, ""))) {
          error = "Please enter a valid phone number";
        }
        break;

      case "recipientEmail":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (
        key !== "dimensions" &&
        key !== "specialInstructions" &&
        key !== "pickupInstructions" &&
        key !== "deliveryInstructions" &&
        key !== "recipientEmail"
      ) {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();

    if (isValid) {
      try {
        await onSubmit(formData);
        Swal.fire({
          title: "Success!",
          text: "Delivery request submitted successfully",
          icon: "success",
          confirmButtonColor: "#007BFF",
        });
        onClose();
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: error.message || "Failed to submit delivery request",
          icon: "error",
          confirmButtonColor: "#007BFF",
        });
      }
    } else {
      // Find first error and scroll to it
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      Swal.fire({
        title: "Validation Error",
        text: "Please check all required fields",
        icon: "warning",
        confirmButtonColor: "#007BFF",
      });
    }
  };

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>New Delivery Request</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Package Information Section */}
          <section className={styles.section}>
            <h3>
              <FaBox /> Package Details
            </h3>

            <div className={styles.formGroup}>
              <label>Item Name *</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${styles.input} ${
                  errors.itemName && touched.itemName ? styles.inputError : ""
                }`}
                placeholder="Enter item name"
              />
              {errors.itemName && touched.itemName && (
                <span className={styles.error}>{errors.itemName}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Description *</label>
              <textarea
                name="itemDescription"
                value={formData.itemDescription}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${styles.input} ${
                  errors.itemDescription && touched.itemDescription
                    ? styles.inputError
                    : ""
                }`}
                placeholder="Describe the item(s)"
              />
              {errors.itemDescription && touched.itemDescription && (
                <span className={styles.error}>{errors.itemDescription}</span>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Weight (kg) *</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    errors.weight && touched.weight ? styles.inputError : ""
                  }`}
                  placeholder="0.0"
                  step="0.1"
                  min="0"
                />
                {errors.weight && touched.weight && (
                  <span className={styles.error}>{errors.weight}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    errors.category && touched.category ? styles.inputError : ""
                  }`}
                >
                  <option value="">Select category</option>
                  <option value="documents">Documents</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="food">Food</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && touched.category && (
                  <span className={styles.error}>{errors.category}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="fragile"
                  checked={formData.fragile}
                  onChange={handleChange}
                />
                Fragile Item
              </label>
            </div>
          </section>

          {/* Pickup Details Section */}
          <section className={styles.section}>
            <h3>
              <FaMapMarkerAlt /> Pickup Details
            </h3>

            <div className={styles.formGroup}>
              <label>Pickup Address *</label>
              <input
                type="text"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${styles.input} ${
                  errors.pickupAddress && touched.pickupAddress
                    ? styles.inputError
                    : ""
                }`}
                placeholder="Enter pickup address"
              />
              {errors.pickupAddress && touched.pickupAddress && (
                <span className={styles.error}>{errors.pickupAddress}</span>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>City *</label>
                <input
                  type="text"
                  name="pickupCity"
                  value={formData.pickupCity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    errors.pickupCity && touched.pickupCity
                      ? styles.inputError
                      : ""
                  }`}
                />
                {errors.pickupCity && touched.pickupCity && (
                  <span className={styles.error}>{errors.pickupCity}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>State *</label>
                <input
                  type="text"
                  name="pickupState"
                  value={formData.pickupState}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    errors.pickupState && touched.pickupState
                      ? styles.inputError
                      : ""
                  }`}
                />
                {errors.pickupState && touched.pickupState && (
                  <span className={styles.error}>{errors.pickupState}</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Pickup Date *</label>
                <input
                  type="date"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    errors.pickupDate && touched.pickupDate
                      ? styles.inputError
                      : ""
                  }`}
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.pickupDate && touched.pickupDate && (
                  <span className={styles.error}>{errors.pickupDate}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Preferred Time *</label>
                <input
                  type="time"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    errors.pickupTime && touched.pickupTime
                      ? styles.inputError
                      : ""
                  }`}
                />
                {errors.pickupTime && touched.pickupTime && (
                  <span className={styles.error}>{errors.pickupTime}</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Contact Name *</label>
                <input
                  type="text"
                  name="pickupContactName"
                  value={formData.pickupContactName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    errors.pickupContactName && touched.pickupContactName
                      ? styles.inputError
                      : ""
                  }`}
                />
                {errors.pickupContactName && touched.pickupContactName && (
                  <span className={styles.error}>
                    {errors.pickupContactName}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Contact Phone *</label>
                <input
                  type="tel"
                  name="pickupContactPhone"
                  value={formData.pickupContactPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    errors.pickupContactPhone && touched.pickupContactPhone
                      ? styles.inputError
                      : ""
                  }`}
                />
                {errors.pickupContactPhone && touched.pickupContactPhone && (
                  <span className={styles.error}>
                    {errors.pickupContactPhone}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Delivery Details Section */}
          <section className={styles.section}>
            <h3>
              <FaUser /> Recipient Details
            </h3>

            <div className={styles.formGroup}>
              <label>Delivery Address *</label>
              <input
                type="text"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${styles.input} ${
                  errors.deliveryAddress && touched.deliveryAddress
                    ? styles.inputError
                    : ""
                }`}
                placeholder="Enter delivery address"
              />
              {errors.deliveryAddress && touched.deliveryAddress && (
                <span className={styles.error}>{errors.deliveryAddress}</span>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>City *</label>
                <input
                  type="text"
                  name="deliveryCity"
                  value={formData.deliveryCity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    errors.deliveryCity && touched.deliveryCity
                      ? styles.inputError
                      : ""
                  }`}
                />
                {errors.deliveryCity && touched.deliveryCity && (
                  <span className={styles.error}>{errors.deliveryCity}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>State *</label>
                <input
                  type="text"
                  name="deliveryState"
                  value={formData.deliveryState}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    errors.deliveryState && touched.deliveryState
                      ? styles.inputError
                      : ""
                  }`}
                />
                {errors.deliveryState && touched.deliveryState && (
                  <span className={styles.error}>{errors.deliveryState}</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Recipient Name *</label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    errors.recipientName && touched.recipientName
                      ? styles.inputError
                      : ""
                  }`}
                />
                {errors.recipientName && touched.recipientName && (
                  <span className={styles.error}>{errors.recipientName}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Recipient Phone *</label>
                <input
                  type="tel"
                  name="recipientPhone"
                  value={formData.recipientPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${styles.input} ${
                    errors.recipientPhone && touched.recipientPhone
                      ? styles.inputError
                      : ""
                  }`}
                />
                {errors.recipientPhone && touched.recipientPhone && (
                  <span className={styles.error}>{errors.recipientPhone}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Recipient Email</label>
              <input
                type="email"
                name="recipientEmail"
                value={formData.recipientEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${styles.input} ${
                  errors.recipientEmail && touched.recipientEmail
                    ? styles.inputError
                    : ""
                }`}
                placeholder="For delivery updates"
              />
              {errors.recipientEmail && touched.recipientEmail && (
                <span className={styles.error}>{errors.recipientEmail}</span>
              )}
            </div>
          </section>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryForm;
