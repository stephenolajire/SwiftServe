import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaSearch } from 'react-icons/fa';
import styles from '../css/NotFound.module.css';
import notFoundImage from '../assets/404.avif'; 

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.content}>
        <img 
          src={notFoundImage} 
          alt="404 Page Not Found" 
          className={styles.notFoundImage} 
        />
        
        <h1 className={styles.title}>Oops! Page Not Found</h1>
        <p className={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className={styles.actions}>
          <button 
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={() => navigate('/')}
          >
            <FaHome /> Back to Home
          </button>
          
          <button 
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Go Back
          </button>
        </div>

        <div className={styles.searchSection}>
          <p>Looking for something specific?</p>
          <div className={styles.searchLinks}>
            <Link to="/tracking">Track Delivery</Link>
            <Link to="/contact">Contact Support</Link>
            <Link to="/services">Our Services</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;