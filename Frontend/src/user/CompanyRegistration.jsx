import React, { useState } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";
import styles from "../css/CompanyRegistration.module.css";
import Swal from "sweetalert2";
import api from "../constant/api";

const CompanyRegistration = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    registrationNumber: "",
    taxId: "",
    website: "",
    countryOfOperation: "",
    cacNumber: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    fleetSize: "",
    fleetType: "",
  });

  const [errors, setErrors] = useState({});
  const [documents, setDocuments] = useState({
    businessLicense: null,
    insuranceCert: null,
    taxClearance: null,
    cacCertificate: null,
  });

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case "companyName":
        return !value ? "Company name is required" : "";
      case "registrationNumber":
        return !value ? "Registration number is required" : "";
      case "taxId":
        return !value ? "Tax ID is required" : "";
      case "website":
        if (value && !/^https?:\/\/.+\..+/.test(value)) {
          return "Must be a valid URL";
        }
        return "";
      case "countryOfOperation":
        return !value ? "Country of operation is required" : "";
      case "cacNumber":
        return formData.countryOfOperation === "Nigeria" && !value
          ? "CAC number is required for Nigerian companies"
          : "";
      case "contactName":
        return !value ? "Contact person name is required" : "";
      case "contactEmail":
        return !value
          ? "Email is required"
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? "Invalid email format"
          : "";
      case "contactPhone":
        return !value
          ? "Phone number is required"
          : !/^\+?[0-9]{8,15}$/.test(value)
          ? "Invalid phone number"
          : "";
      case "address":
        return !value ? "Address is required" : "";
      case "city":
        return !value ? "City is required" : "";
      case "state":
        return !value ? "State is required" : "";
      case "postalCode":
        return !value ? "Postal code is required" : "";
      case "fleetSize":
        return !value
          ? "Fleet size is required"
          : value < 1
          ? "Must have at least 1 vehicle"
          : "";
      case "fleetType":
        return !value ? "Fleet type is required" : "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle file uploads
  const handleFileUpload = (type, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: "Error",
          text: "File size must be less than 5MB",
          icon: "error",
        });
        return;
      }
      setDocuments((prev) => ({ ...prev, [type]: file }));
    }
  };

  const removeFile = (type) => {
    setDocuments((prev) => ({ ...prev, [type]: null }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!validateForm()) {
        Swal.fire({
          title: "Validation Error",
          text: "Please check all required fields",
          icon: "error",
        });
        return;
      }

      // Check required documents
      if (!documents.businessLicense || !documents.insuranceCert) {
        Swal.fire({
          title: "Missing Documents",
          text: "Please upload all required documents",
          icon: "warning",
        });
        return;
      }

      // Check CAC certificate for Nigerian companies
      if (
        formData.countryOfOperation === "Nigeria" &&
        !documents.cacCertificate
      ) {
        Swal.fire({
          title: "Missing CAC Certificate",
          text: "Please upload your CAC certificate",
          icon: "warning",
        });
        return;
      }

      // Create form data for submission
      const formDataToSubmit = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSubmit.append(key, formData[key]);
      });
       formDataToSubmit.append("user_type", "COMPANY");

      // Add documents
      Object.keys(documents).forEach((key) => {
        if (documents[key]) {
          formDataToSubmit.append(key, documents[key]);
        }
      });

      // Show loading state
      Swal.fire({
        title: "Submitting Registration",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Submit to backend
      const response = await api.post("register/company/", formDataToSubmit, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        await Swal.fire({
          title: "Success!",
          text: "Your registration has been submitted for review",
          icon: "success",
        });
        // Reset form
        setFormData({
          companyName: "",
          registrationNumber: "",
          taxId: "",
          website: "",
          countryOfOperation: "",
          cacNumber: "",
          contactName: "",
          contactEmail: "",
          contactPhone: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          fleetSize: "",
          fleetType: "",
        });
        setDocuments({
          businessLicense: null,
          insuranceCert: null,
          taxClearance: null,
          cacCertificate: null,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Failed to submit registration",
        icon: "error",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Company Registration</h1>
        <p className={styles.description}>
          Register your courier company to expand your delivery services through
          our platform.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Company Information Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Company Information</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.companyName ? styles.errorInput : ""
                }`}
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <span className={styles.error}>{errors.companyName}</span>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.registrationNumber ? styles.errorInput : ""
                  }`}
                  placeholder="Enter registration number"
                />
                {errors.registrationNumber && (
                  <span className={styles.error}>
                    {errors.registrationNumber}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tax ID *</label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.taxId ? styles.errorInput : ""
                  }`}
                  placeholder="Enter tax ID"
                />
                {errors.taxId && (
                  <span className={styles.error}>{errors.taxId}</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.website ? styles.errorInput : ""
                  }`}
                  placeholder="https://example.com"
                />
                {errors.website && (
                  <span className={styles.error}>{errors.website}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Country of Operation *</label>
                <select
                  name="countryOfOperation"
                  value={formData.countryOfOperation}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.countryOfOperation ? styles.errorInput : ""
                  }`}
                >
                  <option value="">Select country</option>
                  <option value="Nigeria">Nigeria</option>
                  {/* Add more countries as needed */}
                </select>
                {errors.countryOfOperation && (
                  <span className={styles.error}>
                    {errors.countryOfOperation}
                  </span>
                )}
              </div>
            </div>

            {formData.countryOfOperation === "Nigeria" && (
              <div className={styles.formGroup}>
                <label className={styles.label}>CAC Number *</label>
                <input
                  type="text"
                  name="cacNumber"
                  value={formData.cacNumber}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.cacNumber ? styles.errorInput : ""
                  }`}
                  placeholder="Enter CAC number"
                />
                {errors.cacNumber && (
                  <span className={styles.error}>{errors.cacNumber}</span>
                )}
              </div>
            )}
          </div>

          {/* Contact Information Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Contact Person Name *</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.contactName ? styles.errorInput : ""
                }`}
                placeholder="Enter contact person name"
              />
              {errors.contactName && (
                <span className={styles.error}>{errors.contactName}</span>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Contact Email *</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.contactEmail ? styles.errorInput : ""
                  }`}
                  placeholder="Enter contact email"
                />
                {errors.contactEmail && (
                  <span className={styles.error}>{errors.contactEmail}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Contact Phone *</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.contactPhone ? styles.errorInput : ""
                  }`}
                  placeholder="Enter contact phone"
                />
                {errors.contactPhone && (
                  <span className={styles.error}>{errors.contactPhone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Address Information</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.address ? styles.errorInput : ""
                }`}
                placeholder="Enter street address"
              />
              {errors.address && (
                <span className={styles.error}>{errors.address}</span>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.city ? styles.errorInput : ""
                  }`}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <span className={styles.error}>{errors.city}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.state ? styles.errorInput : ""
                  }`}
                  placeholder="Enter state"
                />
                {errors.state && (
                  <span className={styles.error}>{errors.state}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Postal Code *</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.postalCode ? styles.errorInput : ""
                }`}
                placeholder="Enter postal code"
              />
              {errors.postalCode && (
                <span className={styles.error}>{errors.postalCode}</span>
              )}
            </div>
          </div>

          {/* Fleet Information Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Fleet Information</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Fleet Size *</label>
                <input
                  type="number"
                  name="fleetSize"
                  value={formData.fleetSize}
                  onChange={handleChange}
                  min="1"
                  className={`${styles.input} ${
                    errors.fleetSize ? styles.errorInput : ""
                  }`}
                  placeholder="Number of vehicles"
                />
                {errors.fleetSize && (
                  <span className={styles.error}>{errors.fleetSize}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Fleet Type *</label>
                <select
                  name="fleetType"
                  value={formData.fleetType}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.fleetType ? styles.errorInput : ""
                  }`}
                >
                  <option value="">Select fleet type</option>
                  <option value="Motorcycles">Motorcycles</option>
                  <option value="Cars">Cars</option>
                  <option value="Vans">Vans</option>
                  <option value="Trucks">Trucks</option>
                  <option value="Mixed">Mixed Fleet</option>
                </select>
                {errors.fleetType && (
                  <span className={styles.error}>{errors.fleetType}</span>
                )}
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Required Documents</h2>

            <div className={styles.documentGrid}>
              <div className={styles.documentUpload}>
                <label className={styles.documentLabel}>
                  Business License *
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleFileUpload("businessLicense", e.target.files[0])
                    }
                    className={styles.fileInput}
                  />
                  <div className={styles.uploadBox}>
                    {documents.businessLicense ? (
                      <>
                        <span className={styles.fileName}>
                          {documents.businessLicense.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile("businessLicense")}
                          className={styles.removeFile}
                        >
                          <FaTrash />
                        </button>
                      </>
                    ) : (
                      <>
                        <FaUpload />
                        <span>Upload Business License</span>
                      </>
                    )}
                  </div>
                </label>
              </div>

              <div className={styles.documentUpload}>
                <label className={styles.documentLabel}>
                  Insurance Certificate *
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleFileUpload("insuranceCert", e.target.files[0])
                    }
                    className={styles.fileInput}
                  />
                  <div className={styles.uploadBox}>
                    {documents.insuranceCert ? (
                      <>
                        <span className={styles.fileName}>
                          {documents.insuranceCert.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile("insuranceCert")}
                          className={styles.removeFile}
                        >
                          <FaTrash />
                        </button>
                      </>
                    ) : (
                      <>
                        <FaUpload />
                        <span>Upload Insurance Certificate</span>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {formData.countryOfOperation === "Nigeria" && (
                <div className={styles.documentUpload}>
                  <label className={styles.documentLabel}>
                    CAC Certificate *
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileUpload("cacCertificate", e.target.files[0])
                      }
                      className={styles.fileInput}
                    />
                    <div className={styles.uploadBox}>
                      {documents.cacCertificate ? (
                        <>
                          <span className={styles.fileName}>
                            {documents.cacCertificate.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile("cacCertificate")}
                            className={styles.removeFile}
                          >
                            <FaTrash />
                          </button>
                        </>
                      ) : (
                        <>
                          <FaUpload />
                          <span>Upload CAC Certificate</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              )}

              <div className={styles.documentUpload}>
                <label className={styles.documentLabel}>
                  Tax Clearance
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleFileUpload("taxClearance", e.target.files[0])
                    }
                    className={styles.fileInput}
                  />
                  <div className={styles.uploadBox}>
                    {documents.taxClearance ? (
                      <>
                        <span className={styles.fileName}>
                          {documents.taxClearance.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile("taxClearance")}
                          className={styles.removeFile}
                        >
                          <FaTrash />
                        </button>
                      </>
                    ) : (
                      <>
                        <FaUpload />
                        <span>Upload Tax Clearance (Optional)</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className={styles.submitSection}>
            <button type="submit" className={styles.submitButton}>
              Submit Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegistration;
