import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../constant/api';
import styles from '../css/KYCPendingStatus.module.css';
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const KYCPendingStatus = () => {
  const [kycStatus, setKycStatus] = useState({
    status: 'PENDING',
    submittedAt: null,
    updatedAt: null,
    rejectionReason: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchKYCStatus();
    // Poll for status updates every 30 seconds
    const interval = setInterval(fetchKYCStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await api.get('/kyc/status');
      setKycStatus(response.data);
      
      // If KYC is approved, redirect to dashboard after 3 seconds
      if (response.data.status === 'APPROVED') {
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  };

  const renderStatusIcon = () => {
    switch (kycStatus.status) {
      case 'PENDING':
        return <FaHourglassHalf className={styles.pendingIcon} />;
      case 'APPROVED':
        return <FaCheckCircle className={styles.approvedIcon} />;
      case 'REJECTED':
        return <FaTimesCircle className={styles.rejectedIcon} />;
      default:
        return null;
    }
  };

  const renderStatusMessage = () => {
    switch (kycStatus.status) {
      case 'PENDING':
        return (
          <>
            <h2>Your KYC is Under Review</h2>
            <p>We're currently verifying your information. This usually takes 24-48 hours.</p>
          </>
        );
      case 'APPROVED':
        return (
          <>
            <h2>KYC Approved!</h2>
            <p>Your identity has been verified. Redirecting to dashboard...</p>
          </>
        );
      case 'REJECTED':
        return (
          <>
            <h2>KYC Verification Failed</h2>
            <p>Unfortunately, your KYC was not approved.</p>
            <div className={styles.rejectionReason}>
              <h3>Reason:</h3>
              <p>{kycStatus.rejectionReason}</p>
            </div>
            <button 
              className={styles.retryButton}
              onClick={() => navigate('/kyc')}
            >
              Try Again
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.statusCard}>
        <div className={styles.iconWrapper}>
          {renderStatusIcon()}
        </div>
        <div className={styles.statusContent}>
          {renderStatusMessage()}
        </div>
        {kycStatus.status === 'PENDING' && (
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <span className={styles.timelineDate}>
                {new Date(kycStatus.submittedAt).toLocaleDateString()}
              </span>
              <p>KYC Submitted</p>
            </div>
            <div className={styles.timelineItem}>
              <span className={styles.timelineDate}>
                {new Date(kycStatus.updatedAt).toLocaleDateString()}
              </span>
              <p>Last Updated</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCPendingStatus;