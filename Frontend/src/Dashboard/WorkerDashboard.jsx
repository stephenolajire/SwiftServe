import React, { useState } from 'react';
import { FaBox, FaTruck, FaMoneyBillWave, FaStar, FaRoute } from 'react-icons/fa';
import styles from '../css/WorkerDashboard.module.css';

const WorkerDashboard = () => {
  const [deliveries, setDeliveries] = useState({
    pending: [],
    active: [],
    completed: []
  });

  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0
  });

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Worker Dashboard</h1>
        <div className={styles.status}>
          <span className={styles.statusIndicator}></span>
          Available for Deliveries
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaBox />
          </div>
          <div className={styles.statInfo}>
            <h3>Pending Deliveries</h3>
            <p>{deliveries.pending.length}</p>
          </div>
        </div>

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
            <FaMoneyBillWave />
          </div>
          <div className={styles.statInfo}>
            <h3>Today's Earnings</h3>
            <p>₦{earnings.today.toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaStar />
          </div>
          <div className={styles.statInfo}>
            <h3>Rating</h3>
            <p>4.8</p>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.deliveriesSection}>
          <div className={styles.sectionHeader}>
            <h2>Current Deliveries</h2>
            <div className={styles.deliveryTabs}>
              <button className={styles.activeTab}>Active</button>
              <button>Pending</button>
              <button>Completed</button>
            </div>
          </div>
          <div className={styles.deliveryList}>
            {/* Delivery items will go here */}
          </div>
        </div>

        <div className={styles.routeSection}>
          <h2>Delivery Route</h2>
          <div className={styles.map}>
            {/* Map component will go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;