import React, { useState } from 'react';
import { FaUsers, FaTruck, FaBoxOpen, FaChartLine, FaUserPlus } from 'react-icons/fa';
import styles from '../css/CompanyDashboard.module.css';
import { Link } from 'react-router-dom';
// import styles from '../css/Individual.module.css'

const CompanyDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [deliveries, setDeliveries] = useState({
    active: 0,
    completed: 0
  });
  const [revenue, setRevenue] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0
  });

  const handleAddWorker = () => {
    // Add worker logic
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Company Dashboard</h1>
        <Link to='/worker'>
          <button onClick={handleAddWorker} className={styles.addWorkerBtn}>
            <FaUserPlus /> Add Worker
          </button>
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Workers</h3>
            <p>{workers.length}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaTruck />
          </div>
          <div className={styles.statInfo}>
            <h3>Active Deliveries</h3>
            <p>{deliveries.active}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaBoxOpen />
          </div>
          <div className={styles.statInfo}>
            <h3>Completed Deliveries</h3>
            <p>{deliveries.completed}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaChartLine />
          </div>
          <div className={styles.statInfo}>
            <h3>Monthly Revenue</h3>
            <p>₦{revenue.monthly.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.workersSection}>
          <h2>Workers Overview</h2>
          <div className={styles.workersList}>
            {workers.map((worker) => (
              <div key={worker.id} className={styles.workerCard}>
                <img src={worker.avatar} alt={worker.name} />
                <div className={styles.workerInfo}>
                  <h3>{worker.name}</h3>
                  <p>{worker.status}</p>
                </div>
                <div className={styles.workerStats}>
                  <span>Deliveries: {worker.deliveries}</span>
                  <span>Rating: {worker.rating}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.revenueSection}>
          <h2>Revenue Analytics</h2>
          <div className={styles.revenueChart}>
            {/* Revenue chart component will go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;