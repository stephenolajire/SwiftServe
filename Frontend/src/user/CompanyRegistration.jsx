import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaUpload, FaTrash } from 'react-icons/fa';
import styles from '../css/CompanyRegistration.module.css';
import Swal from 'sweetalert2';

const schema = yup.object().shape({
  // Company Details
  companyName: yup.string().required('Company name is required'),
  registrationNumber: yup.string().required('Registration number is required'),
  taxId: yup.string().required('Tax ID is required'),
  website: yup.string().url('Must be a valid URL'),
  countryOfOperation: yup.string().required('Country of operation is required'),
  
  // CAC Details for Nigerian Companies
  cacNumber: yup.string().when('countryOfOperation', {
    is: 'Nigeria',
    then: () => yup.string().required('CAC number is required for Nigerian companies'),
    otherwise: () => yup.string()
  }),
  
  // Contact Information
  contactName: yup.string().required('Contact person name is required'),
  contactEmail: yup.string().email('Invalid email').required('Email is required'),
  contactPhone: yup.string()
    .matches(/^\+?[0-9]{8,15}$/, 'Invalid phone number')
    .required('Phone number is required'),
  
  // Address
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  postalCode: yup.string().required('Postal code is required'),
  
  // Fleet Information
  fleetSize: yup.number()
    .required('Fleet size is required')
    .min(1, 'Must have at least 1 vehicle'),
  fleetType: yup.string().required('Fleet type is required'),
});

const CompanyRegistration = () => {
  const [documents, setDocuments] = useState({
    businessLicense: null,
    insuranceCert: null,
    taxClearance: null,
    cacCertificate: null
  });

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema)
  });

  const selectedCountry = watch('countryOfOperation');

  const handleFileUpload = (type, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: 'Error',
          text: 'File size must be less than 5MB',
          icon: 'error'
        });
        return;
      }
      setDocuments(prev => ({ ...prev, [type]: file }));
    }
  };

  const removeFile = (type) => {
    setDocuments(prev => ({ ...prev, [type]: null }));
  };

  const onSubmit = async (data) => {
    try {
      // Check if all required documents are uploaded
      if (!documents.businessLicense || !documents.insuranceCert) {
        Swal.fire({
          title: 'Missing Documents',
          text: 'Please upload all required documents',
          icon: 'warning'
        });
        return;
      }

      // Check CAC certificate for Nigerian companies
      if (data.countryOfOperation === 'Nigeria' && !documents.cacCertificate) {
        Swal.fire({
          title: 'Missing CAC Certificate',
          text: 'Please upload your CAC certificate',
          icon: 'warning'
        });
        return;
      }

      // Create form data for file upload
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          formData.append(key, documents[key]);
        }
      });

      // Show loading state
      Swal.fire({
        title: 'Submitting Registration',
        text: 'Please wait...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Submit registration (replace with your API endpoint)
      const response = await fetch('/api/company-registration', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Your registration has been submitted for review',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to submit registration. Please try again.',
        icon: 'error'
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1>Company Registration</h1>
        <p className={styles.subtitle}>Join our delivery partner network</p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Company Details Section */}
          <section className={styles.section}>
            <h2>Company Details</h2>
            
            <div className={styles.formGroup}>
              <label>Company Name *</label>
              <input
                type="text"
                {...register('companyName')}
                className={errors.companyName ? styles.errorInput : ''}
              />
              {errors.companyName && (
                <span className={styles.errorMessage}>{errors.companyName.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Country of Operation *</label>
              <select
                {...register('countryOfOperation')}
                className={errors.countryOfOperation ? styles.errorInput : ''}
              >
                <option value="">Select country</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
                <option value="Other">Other</option>
              </select>
              {errors.countryOfOperation && (
                <span className={styles.errorMessage}>{errors.countryOfOperation.message}</span>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Registration Number *</label>
                <input
                  type="text"
                  {...register('registrationNumber')}
                  className={errors.registrationNumber ? styles.errorInput : ''}
                />
                {errors.registrationNumber && (
                  <span className={styles.errorMessage}>{errors.registrationNumber.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Tax ID *</label>
                <input
                  type="text"
                  {...register('taxId')}
                  className={errors.taxId ? styles.errorInput : ''}
                />
                {errors.taxId && (
                  <span className={styles.errorMessage}>{errors.taxId.message}</span>
                )}
              </div>
            </div>

            {selectedCountry === 'Nigeria' && (
              <div className={styles.formGroup}>
                <label>CAC Number *</label>
                <input
                  type="text"
                  {...register('cacNumber')}
                  className={errors.cacNumber ? styles.errorInput : ''}
                />
                {errors.cacNumber && (
                  <span className={styles.errorMessage}>{errors.cacNumber.message}</span>
                )}
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Website</label>
              <input
                type="url"
                {...register('website')}
                className={errors.website ? styles.errorInput : ''}
                placeholder="https://"
              />
              {errors.website && (
                <span className={styles.errorMessage}>{errors.website.message}</span>
              )}
            </div>
          </section>

          {/* Rest of the existing sections */}
          {/* ... Contact Information section ... */}
          {/* ... Fleet Information section ... */}

          {/* Document Upload */}
          <section className={styles.section}>
            <h2>Required Documents</h2>
            <p className={styles.uploadInfo}>
              Please upload clear, readable copies of the following documents (PDF or images, max 5MB each)
            </p>

            <div className={styles.documentGrid}>
              <div className={styles.uploadBox}>
                <label>Business License *</label>
                <div className={styles.uploadArea}>
                  {documents.businessLicense ? (
                    <div className={styles.uploadedFile}>
                      <span>{documents.businessLicense.name}</span>
                      <button 
                        type="button"
                        onClick={() => removeFile('businessLicense')}
                        className={styles.removeButton}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.uploadPrompt}>
                      <FaUpload />
                      <span>Upload Business License</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('businessLicense', e.target.files[0])}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.uploadBox}>
                <label>Insurance Certificate *</label>
                <div className={styles.uploadArea}>
                  {documents.insuranceCert ? (
                    <div className={styles.uploadedFile}>
                      <span>{documents.insuranceCert.name}</span>
                      <button 
                        type="button"
                        onClick={() => removeFile('insuranceCert')}
                        className={styles.removeButton}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.uploadPrompt}>
                      <FaUpload />
                      <span>Upload Insurance Certificate</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('insuranceCert', e.target.files[0])}
                      />
                    </div>
                  )}
                </div>
              </div>

              {selectedCountry === 'Nigeria' && (
                <div className={styles.uploadBox}>
                  <label>CAC Certificate *</label>
                  <div className={styles.uploadArea}>
                    {documents.cacCertificate ? (
                      <div className={styles.uploadedFile}>
                        <span>{documents.cacCertificate.name}</span>
                        <button 
                          type="button"
                          onClick={() => removeFile('cacCertificate')}
                          className={styles.removeButton}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ) : (
                      <div className={styles.uploadPrompt}>
                        <FaUpload />
                        <span>Upload CAC Certificate</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('cacCertificate', e.target.files[0])}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          <button type="submit" className={styles.submitButton}>
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegistration;