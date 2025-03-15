import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaBuilding,
  FaCar,
  FaPhone,
  FaEnvelope,
  FaMapMarker,
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaIdCard,
} from "react-icons/fa";
import api from "../constant/api";
import styles from "../css/UserDetails.module.css";
import Swal from "sweetalert2";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get(`admin/users/${id}/`);
      if (!response.data.user_type) {
        // If user_type is missing, determine it from other fields
        const userData = response.data;
        let userType;

        if (userData.companyName) {
          userType = "COMPANY";
        } else if (userData.vehiclePlateNumber) {
          userType = "WORKER";
        } else {
          userType = "INDIVIDUAL";
        }

        // Set the user data with determined type
        setUser({ ...userData, user_type: userType });
      } else {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      Swal.fire({
        title: "Error",
        text:
          "Failed to fetch user details: " +
          (error.response?.data?.error || error.message),
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderUserHeader = () => (
    <div className={styles.userHeader}>
      <div className={styles.headerLeft}>
        <button onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
      </div>
      <div className={styles.headerCenter}>
        <h1>{user?.companyName || `${user?.firstName} ${user?.lastName}`}</h1>
        <p className={styles.userType}>{user?.user_type}</p>
      </div>
      <div className={styles.headerRight}>
        <div className={styles.kycBadge}>
          {user?.kyc_status ? (
            <span className={styles.verified}>
              <FaCheckCircle /> Verified
            </span>
          ) : (
            <span className={styles.pending}>
              <FaClock /> KYC Pending
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderCompanyDetails = () => (
    <>
      <section className={styles.mainInfo}>
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <FaBuilding />
            <h2>Company Overview</h2>
          </div>
          <div className={styles.cardGrid}>
            <InfoItem label="Registration" value={user.registrationNumber} />
            <InfoItem label="Tax ID" value={user.taxId} />
            <InfoItem label="CAC Number" value={user.cacNumber} />
            <InfoItem label="Website" value={user.website} isLink />
          </div>
        </div>
      </section>

      <section className={styles.additionalInfo}>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <FaCar />
              <h2>Fleet Details</h2>
            </div>
            <div className={styles.cardContent}>
              <InfoItem label="Fleet Size" value={user.fleetSize} />
              <InfoItem label="Fleet Type" value={user.fleetType} />
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <FaFileAlt />
              <h2>Documents</h2>
            </div>
            <div className={styles.documentGrid}>
              <DocumentCard
                title="Business License"
                url={user.businessLicense}
                icon={<FaIdCard />}
              />
              <DocumentCard
                title="Insurance Certificate"
                url={user.insuranceCert}
                icon={<FaFileAlt />}
              />
              <DocumentCard
                title="CAC Certificate"
                url={user.cacCertificate}
                icon={<FaFileAlt />}
              />
              <DocumentCard
                title="Tax Clearance"
                url={user.taxClearance}
                icon={<FaFileAlt />}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const renderWorkerDetails = () => (
    <div className={styles.detailsGrid}>
      <DetailCard icon={<FaUser />} title="Personal Information">
        <p>
          <strong>Name:</strong> {`${user.firstName} ${user.lastName}`}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Phone:</strong> {user.phoneNumber}
        </p>
        <p>
          <strong>Date of Birth:</strong>{" "}
          {new Date(user.dob).toLocaleDateString()}
        </p>
      </DetailCard>

      <DetailCard icon={<FaCar />} title="Vehicle Information">
        <p>
          <strong>Vehicle Type:</strong> {user.vehicleType}
        </p>
        <p>
          <strong>Plate Number:</strong> {user.vehiclePlateNumber}
        </p>
        <DocumentLink
          title="Vehicle Registration"
          url={user.vehicleRegistration}
        />
        <DocumentLink title="Driver's License" url={user.driversLicense} />
      </DetailCard>

      <DetailCard icon={<FaMapMarker />} title="Location">
        <p>
          <strong>Address:</strong> {user.address}
        </p>
        <p>
          <strong>City:</strong> {user.city}
        </p>
        <p>
          <strong>State:</strong> {user.state}
        </p>
        <p>
          <strong>Local Government:</strong> {user.localGovernment}
        </p>
      </DetailCard>
    </div>
  );

  const renderIndividualDetails = () => (
    <div className={styles.detailsGrid}>
      {user.profileImage && (
        <DetailCard icon={<FaUser />} title="Profile Image">
          <img
            src={`http://localhost:8000${user.profileImage}`}
            alt="Profile"
            className={styles.profileImage}
          />
        </DetailCard>
      )}
      <DetailCard icon={<FaUser />} title="Personal Information">
        <p className={styles.ppp}>
          <strong>Name:</strong> {`${user.firstName} ${user.lastName}`}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Phone:</strong> {user.phoneNumber}
        </p>
        <p>
          <strong>Date of Birth:</strong>{" "}
          {new Date(user.dob).toLocaleDateString()}
        </p>
      </DetailCard>

      <DetailCard icon={<FaMapMarker />} title="Location">
        <p>
          <strong>Address:</strong> {user.address}
        </p>
        <p>
          <strong>City:</strong> {user.city}
        </p>
        <p>
          <strong>State:</strong> {user.state}
        </p>
        <p>
          <strong>Local Government:</strong> {user.localGovernment}
        </p>
      </DetailCard>
    </div>
  );

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      {renderUserHeader()}
      <div className={styles.content}>
        {user?.user_type === "COMPANY" && renderCompanyDetails()}
        {user?.user_type === "WORKER" && renderWorkerDetails()}
        {(user?.user_type === "INDIVIDUAL" || user?.user_type === "CLIENT") &&
          renderIndividualDetails()}
      </div>
    </div>
  );
};

const DetailCard = ({ icon, title, children }) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      {icon}
      <h3>{title}</h3>
    </div>
    <div className={styles.cardContent}>{children}</div>
  </div>
);

const DocumentLink = ({ title, url }) => {
  if (!url) return null;
  return (
    <a
      href={`http://localhost:8000${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.documentLink}
    >
      View {title}
    </a>
  );
};

const InfoItem = ({ label, value, isLink }) => {
  if (!value) return null;
  return (
    <div className={styles.infoItem}>
      <span className={styles.label}>{label}</span>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      ) : (
        <span className={styles.value}>{value}</span>
      )}
    </div>
  );
};

const DocumentCard = ({ title, url, icon }) => {
  if (!url) return null;
  return (
    <a
      href={`http://localhost:8000${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.documentCard}
    >
      {icon}
      <span>{title}</span>
    </a>
  );
};

export default UserDetails;
