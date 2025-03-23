import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import api from "../constant/api";
import styles from "../css/KYCVerification.module.css";
import Swal from "sweetalert2";

const KYCVerification = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    idType: "",
    idNumber: "",
  });
  const [idDocument, setIdDocument] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIdUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire("Error", "File size must be less than 5MB", "error");
        return;
      }
      setIdDocument(file);
    }
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setSelfieImage(imageSrc);
    setShowCamera(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.dateOfBirth ||
      !formData.idType ||
      !formData.idNumber ||
      !idDocument ||
      !selfieImage
    ) {
      Swal.fire({
        title: "Error",
        text: "Please fill all required fields",
        icon: "error",
      });
      return;
    }

    try {
      // Show loading state
      Swal.fire({
        title: "Submitting...",
        text: "Please wait while we process your verification",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const formDataToSubmit = new FormData();

      // Log form data for debugging
      console.log("Form Data:", formData);

      // Append form data
      Object.keys(formData).forEach((key) => {
        formDataToSubmit.append(key, formData[key]);
      });

      // Append ID document
      if (idDocument) {
        console.log("ID Document:", idDocument.name, idDocument.type);
        formDataToSubmit.append("idDocument", idDocument);
      }

      // Convert and append selfie
      if (selfieImage) {
        try {
          const response = await fetch(selfieImage);
          const blob = await response.blob();
          const selfieFile = new File([blob], "selfie.jpg", {
            type: "image/jpeg",
          });
          console.log("Selfie File:", selfieFile.name, selfieFile.type);
          formDataToSubmit.append("selfieImage", selfieFile);
        } catch (error) {
          console.error("Selfie conversion error:", error);
          throw error;
        }
      }

      // Log the complete FormData
      for (let pair of formDataToSubmit.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Make the API call
      console.log("Sending request to:", "kyc/submit/");
      const response = await api.post("kyc/submit/", formDataToSubmit, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Add timeout and validate status
        // timeout: 30000,
        validateStatus: (status) => status >= 200 && status < 300,
      });

      console.log("Response:", response.data);

      if (response.status === 201) {
        await Swal.fire({
          title: "Success",
          text: "KYC verification submitted successfully",
          icon: "success",
          timer: 1500,
        });
        navigate("/kyc-status");
      }
    } catch (error) {
      console.error("KYC submission error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Failed to submit KYC verification",
        icon: "error",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h4>KYC Verification</h4>
        <form onSubmit={handleSubmit}>
          <div className={styles.section}>
            <h5>Personal Information</h5>

            <div className={styles.formGroup}>
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.section}>
            <h4>ID Verification</h4>

            <div className={styles.formGroup}>
              <label>ID Type</label>
              <select
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                required
              >
                <option value="">Select ID Type</option>
                <option value="DL">Driver's License</option>
                <option value="PP">International Passport</option>
                <option value="VC">Voter's Card</option>
                <option value="NI">National ID</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>ID Number</label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.uploadSection}>
              <label>Upload ID Document</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleIdUpload}
                required
              />
              {idDocument && (
                <div className={styles.preview}>
                  <img src={URL.createObjectURL(idDocument)} alt="ID Preview" />
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2>Selfie Verification</h2>
            {!selfieImage && !showCamera ? (
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className={styles.cameraButton}
              >
                Take Selfie
              </button>
            ) : showCamera ? (
              <div className={styles.cameraSection}>
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className={styles.camera}
                />
                <button
                  type="button"
                  onClick={captureImage}
                  className={styles.captureButton}
                >
                  Capture
                </button>
              </div>
            ) : (
              <div className={styles.preview}>
                <img src={selfieImage} alt="Selfie Preview" />
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className={styles.retakeButton}
                >
                  Retake
                </button>
              </div>
            )}
          </div>

          <button type="submit" className={styles.submitButton}>
            Submit Verification
          </button>
        </form>
      </div>
    </div>
  );
};

export default KYCVerification;
