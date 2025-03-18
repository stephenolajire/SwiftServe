import React, { useState, useEffect } from "react";
import { FaBox, FaTruck, FaClock, FaHistory, FaPlus } from "react-icons/fa";
import styles from "../css/ClientDashboard.module.css";
import { Link } from "react-router-dom";
import api from "../constant/api";
import Swal from "sweetalert2";

// Add DeliveryCard component
const DeliveryCard = ({ delivery }) => (
  <div className={styles.deliveryCard}>
    <div className={styles.deliveryHeader}>
      <h4>{delivery.itemName}</h4>
      <span
        className={`${styles.status} ${styles[delivery.status.toLowerCase()]}`}
      >
        {delivery.status_display}
      </span>
    </div>
    <div className={styles.deliveryDetails}>
      <div className={styles.detail}>
        <span>From:</span>
        <p>{delivery.pickupCity}</p>
      </div>
      <div className={styles.detail}>
        <span>To:</span>
        <p>{delivery.deliveryCity}</p>
      </div>
      <div className={styles.detail}>
        <span>Created:</span>
        <p>{new Date(delivery.created_at).toLocaleDateString()}</p>
      </div>
      <div className={styles.detail}>
        <span>Price:</span>
        <p>₦{delivery.estimated_price}</p>
      </div>
    </div>
    {delivery.worker && (
      <div className={styles.workerInfo}>
        <span>Driver:</span>
        <p>{delivery.worker_name}</p>
      </div>
    )}
  </div>
);

const ClientDashboard = () => {
  const [deliveries, setDeliveries] = useState({
    active: [],
    pending: [],
    completed: [],
  });

  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchDeliveries();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("user/profile");
      setUserName(response.data.data.firstName);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch user profile",
        icon: "error",
        confirmButtonColor: "#007BFF",
      });
    }
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get("deliveries/");

      // Access the data array from the response
      const deliveriesData = response.data.data || [];
      console.log(response.data.data)

      // Categorize deliveries
      const categorizedDeliveries = {
        active: deliveriesData.filter(
          (d) => d.status === "IN_TRANSIT" || d.status === "ACCEPTED"
        ),
        pending: deliveriesData.filter((d) => d.status === "PENDING"),
        completed: deliveriesData.filter((d) => d.status === "DELIVERED"),
      };

      setDeliveries(categorizedDeliveries);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch deliveries",
        icon: "error",
        confirmButtonColor: "#007BFF",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDeliveries = () => {
    if (filter === "all") {
      return [
        ...deliveries.active,
        ...deliveries.pending,
        ...deliveries.completed,
      ];
    }
    return deliveries[filter] || [];
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Welcome Back, John</h1>
        <Link to="/add-item">
          <button className={styles.newDeliveryBtn}>
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
            <h3>Pending Deliveries</h3>
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
              <select
                className={styles.filterSelect}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Deliveries</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className={styles.deliveryList}>
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading deliveries...</p>
              </div>
            ) : getFilteredDeliveries().length > 0 ? (
              getFilteredDeliveries().map((delivery) => (
                <DeliveryCard key={delivery.id} delivery={delivery} />
              ))
            ) : (
              <div className={styles.noDeliveries}>
                <FaBox size={48} color="#ccc" />
                <p>No deliveries found</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.trackingSection}>
          <h2>Live Tracking</h2>
          <div className={styles.trackingMap}>
            <div className={styles.mapPlaceholder}>
              <p>Live tracking coming soon!</p>
            </div>
          </div>
          <div className={styles.deliveryUpdates}>
            <h3>Recent Updates</h3>
            <div className={styles.updatesList}>
              {getFilteredDeliveries()
                .slice(0, 5)
                .map((delivery) => (
                  <div key={delivery.id} className={styles.updateItem}>
                    <div className={styles.updateTime}>
                      {new Date(delivery.updated_at).toLocaleTimeString()}
                    </div>
                    <div className={styles.updateContent}>
                      <h4>{delivery.itemName}</h4>
                      <p>{delivery.status_display}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
