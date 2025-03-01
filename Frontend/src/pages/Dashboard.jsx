import React, { useState } from 'react';
import { FaBox, FaMoneyBillWave, FaRoute, FaStar, FaClock, FaCheckCircle, FaTruck, FaMapMarkerAlt } from 'react-icons/fa';
import styles from '../css/Dashboard.module.css';

const Dashboard = () => {
  // Mock data - replace with actual API data
  const [activeDeliveries] = useState([
    {
      id: 1,
      itemName: "Electronics Package",
      pickupAddress: "123 Tech Street",
      deliveryAddress: "456 Home Road",
      status: "In Transit",
      estimatedTime: "30 mins"
    },
    // Add more deliveries...
  ]);

  return (
    <div className={styles.container}>
      {/* Stats Overview */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <FaBox className={styles.icon} />
          <div className={styles.statInfo}>
            <h3>Total Deliveries</h3>
            <p className={styles.statNumber}>1,234</p>
            <span className={styles.trend}>+15% this week</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <FaMoneyBillWave className={styles.icon} />
          <div className={styles.statInfo}>
            <h3>Total Earnings</h3>
            <p className={styles.statNumber}>$3,456</p>
            <span className={styles.trend}>+8% this week</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <FaRoute className={styles.icon} />
          <div className={styles.statInfo}>
            <h3>Distance Covered</h3>
            <p className={styles.statNumber}>2,789 km</p>
            <span className={styles.trend}>This month</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <FaStar className={styles.icon} />
          <div className={styles.statInfo}>
            <h3>Rating</h3>
            <p className={styles.statNumber}>4.8/5.0</p>
            <span className={styles.trend}>From 156 reviews</span>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <div className={styles.dashboardContent}>
        {/* Active Deliveries */}
        <section className={styles.activeDeliveries}>
          <div className={styles.sectionHeader}>
            <h2>Active Deliveries</h2>
            <button className={styles.refreshButton}>Refresh</button>
          </div>

          <div className={styles.deliveriesList}>
            {activeDeliveries.map(delivery => (
              <div key={delivery.id} className={styles.deliveryCard}>
                <div className={styles.deliveryStatus}>
                  <FaTruck className={styles.statusIcon} />
                  <span>{delivery.status}</span>
                </div>
                
                <h3>{delivery.itemName}</h3>
                
                <div className={styles.addressInfo}>
                  <div className={styles.address}>
                    <FaMapMarkerAlt />
                    <div>
                      <p className={styles.addressLabel}>Pickup</p>
                      <p>{delivery.pickupAddress}</p>
                    </div>
                  </div>
                  <div className={styles.address}>
                    <FaMapMarkerAlt />
                    <div>
                      <p className={styles.addressLabel}>Delivery</p>
                      <p>{delivery.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.deliveryFooter}>
                  <span className={styles.estimatedTime}>
                    <FaClock /> {delivery.estimatedTime}
                  </span>
                  <button className={styles.viewDetailsButton}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity & Performance */}
        <div className={styles.sideSection}>
          {/* Performance Metrics */}
          <section className={styles.performanceMetrics}>
            <h2>Performance Metrics</h2>
            <div className={styles.metrics}>
              <div className={styles.metric}>
                <h4>On-Time Delivery Rate</h4>
                <div className={styles.progressBar}>
                  <div className={styles.progress} style={{ width: '95%' }}>
                    95%
                  </div>
                </div>
              </div>
              
              <div className={styles.metric}>
                <h4>Customer Satisfaction</h4>
                <div className={styles.progressBar}>
                  <div className={styles.progress} style={{ width: '88%' }}>
                    88%
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className={styles.recentActivity}>
            <h2>Recent Activity</h2>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <FaCheckCircle className={styles.activityIcon} />
                <div className={styles.activityInfo}>
                  <p>Delivery Completed</p>
                  <span>Package #1234 - 2 hours ago</span>
                </div>
              </div>
              {/* Add more activity items */}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;