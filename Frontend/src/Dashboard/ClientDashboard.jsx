import React, { useState } from 'react';
import { FaBox, FaTruck, FaClock, FaHistory, FaPlus } from 'react-icons/fa';
import styles from '../css/ClientDashboard.module.css';
import { Link } from 'react-router-dom';

const ClientDashboard = () => {
  const [deliveries, setDeliveries] = useState({
    active: [],
    pending: [],
    completed: []
  });

  const handleNewDelivery = () => {
    // New delivery logic
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Welcome Back, John</h1>
        <Link to='/add-item'>
          <button className={styles.newDeliveryBtn} onClick={handleNewDelivery}>
            <FaPlus /> New Delivery Request
          </button>
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaTruck />
          </div>
          <div className={styles.statInfo}>
            <h3>Active Deliveries</h3>
            <p>{deliveries.active.length}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaClock />
          </div>
          <div className={styles.statInfo}>
            <h3>Pending Requests</h3>
            <p>{deliveries.pending.length}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaHistory />
          </div>
          <div className={styles.statInfo}>
            <h3>Completed Deliveries</h3>
            <p>{deliveries.completed.length}</p>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.deliverySection}>
          <div className={styles.sectionHeader}>
            <h2>Your Deliveries</h2>
            <div className={styles.filterControls}>
              <select className={styles.filterSelect}>
                <option value="all">All Deliveries</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className={styles.deliveryList}>
            {/* Delivery items will be mapped here */}
          </div>
        </div>

        <div className={styles.trackingSection}>
          <h2>Live Tracking</h2>
          <div className={styles.trackingMap}>
            {/* Map component will go here */}
          </div>
          <div className={styles.deliveryUpdates}>
            <h3>Recent Updates</h3>
            {/* Updates list will go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;