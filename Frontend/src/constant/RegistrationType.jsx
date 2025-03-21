import React from "react";
import styles from '../css/RegistrationForm.module.css'
import { useNavigate } from "react-router-dom";

const RegistrationType = () => {
  const registrationTypes = {
    individual: {
      title: "Individual Courier",
      description:
        "Perfect for individuals looking to earn extra income by providing delivery services within their neighborhood. Join our community and make extra income.",
      path: "/individual",
    },
    company: {
      title: "Courier Company",
      description:
        "For established courier services and logistics companies. Expand your reach and manage your delivery fleet efficiently through our platform.",
      path: "/company",
    },
    client: {
      title: "Client",
      description:
        "Need items delivered? Register as a client to post delivery requests and connect with reliable couriers in your area for quick and secure deliveries.",
      path: "client",
    },
  };

   const navigate = useNavigate();

  const handleRegistrationTypeSelect = (path) => {
    navigate(path);
  };
  return (
    <div>
      <div className={styles.registrationTypes}>
        <h4 className={styles.mainTitle}>Choose Registration Type</h4>
        <div className={styles.typeContainer}>
          {Object.entries(registrationTypes).map(
            ([key, { title, description, path }]) => (
              <div key={key} className={styles.typeCard}>
                <h5>{title}</h5>
                <p>{description}</p>
                <button
                  onClick={() => handleRegistrationTypeSelect(path)}
                  className={styles.typeButton}
                >
                  Register as {title}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationType;
