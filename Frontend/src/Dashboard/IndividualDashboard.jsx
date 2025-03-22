import React, { useState } from 'react';
import styles from '../css/Individual.module.css';
import { FaBox, FaTruck, FaHistory, FaStar, FaWallet } from 'react-icons/fa';
import { MEDIA_BASE_URL } from '../constant/api';

const IndividualDashboard = () => {
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  return (
    <div className={styles.dashboard}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaBox />
          </div>
          <div className={styles.statInfo}>
            <h5>Active Deliveries</h5>
            <p>{activeDeliveries.length}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaHistory />
          </div>
          <div className={styles.statInfo}>
            <h5>Completed Deliveries</h5>
            <p>{deliveryHistory.length}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaStar />
          </div>
          <div className={styles.statInfo}>
            <h5>Rating</h5>
            <p>4.8/5.0</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaWallet />
          </div>
          <div className={styles.statInfo}>
            <h5>Today's Earnings</h5>
            <p>₦{earnings.today.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.activeDeliveries}>
          <h5>Active Deliveries</h5>
          {/* Active deliveries list */}
        </div>

        <div className={styles.earnings}>
          <h5>Earnings Overview</h5>
          {/* Earnings chart */}
        </div>
      </div>
    </div>
  );
};

export default IndividualDashboard;