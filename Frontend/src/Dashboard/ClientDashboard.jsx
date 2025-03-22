import React, { useState, useEffect } from "react";
import {
  FaBox,
  FaTruck,
  FaClock,
  FaHistory,
  FaPlus,
  FaMapMarkerAlt,
} from "react-icons/fa";
import styles from "../css/ClientDashboard.module.css";
import { Link } from "react-router-dom";
import api from "../constant/api";
import Swal from "sweetalert2";
import ChatModal from "../components/ChatModal";
import NotificationBadge from "../components/NotificationBadge";
import LocationTracker from "../components/LocationTracker";

// Update DeliveryCard to include debug logging
const DeliveryCard = ({ delivery, onOpenChat, unreadMessages }) => {
  const hasUnreadMessages = unreadMessages && unreadMessages[delivery.id] > 0;

  return (
    <div className={styles.deliveryCard}>
      <div className={styles.deliveryHeader}>
        <h5>
          {delivery.itemName}
          {hasUnreadMessages && <span className={styles.unreadDot}></span>}
        </h5>
        <span
          className={`${styles.status} ${
            styles[delivery.status.toLowerCase()]
          }`}
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
        <div className={styles.cardActions}>
          <div className={styles.workerInfo}>
            <span>Driver:</span>
            <p>{delivery.worker_name}</p>
          </div>
          <button
            onClick={() => onOpenChat(delivery)}
            className={`${styles.chatButton} ${
              hasUnreadMessages ? styles.hasUnread : ""
            }`}
          >
            <div className={styles.chatButtonContent}>
              Chat with Driver
              {hasUnreadMessages && (
                <NotificationBadge count={unreadMessages[delivery.id]} />
              )}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

const ClientDashboard = () => {
  const [deliveries, setDeliveries] = useState({
    active: [],
    pending: [],
    completed: [],
  });

  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    const initializeDashboard = async () => {
      await Promise.all([
        fetchDeliveries(),
        fetchUserProfile(),
        checkNewMessages(),
      ]);
    };

    initializeDashboard();

    // Poll for new messages every 5 seconds
    const messageInterval = setInterval(checkNewMessages, 5000);
    return () => clearInterval(messageInterval);
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
      // console.log(response.data.data);

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

  const handleOpenChat = (delivery) => {
    setSelectedDelivery(delivery);
    // Clear unread count when opening chat
    setUnreadMessages((prev) => ({
      ...prev,
      [delivery.id]: 0,
    }));
  };

  const checkNewMessages = async () => {
    try {
      const response = await api.get("deliveries/messages/unread/");
      console.log("Unread messages response:", response.data);

      if (response.data.status === "success") {
        console.log("Setting unread messages:", response.data.data);
        setUnreadMessages(response.data.data);
      }
    } catch (error) {
      console.error("Error checking messages:", error);
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h4>Welcome Back, {userName}</h4>
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
            <h5>Active Deliveries</h5>
            <p>{deliveries.active.length}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaClock />
          </div>
          <div className={styles.statInfo}>
            <h5>Pending Deliveries</h5>
            <p>{deliveries.pending.length}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaHistory />
          </div>
          <div className={styles.statInfo}>
            <h5>Completed Deliveries</h5>
            <p>{deliveries.completed.length}</p>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.deliverySection}>
          <div className={styles.sectionHeader}>
            <h5>Your Deliveries</h5>
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
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  onOpenChat={handleOpenChat}
                  unreadMessages={unreadMessages}
                />
              ))
            ) : (
              <div className={styles.noDeliveries}>
                <FaBox size={48} color="#ccc" />
                <p>No deliveries found</p>
              </div>
            )}
          </div>

          {selectedDelivery && (
            <ChatModal
              delivery={selectedDelivery}
              onClose={() => {
                setSelectedDelivery(null);
                // Refresh unread messages when closing chat
                checkNewMessages();
              }}
            />
          )}
        </div>

        <div className={styles.trackingSection}>
          <div className={styles.sectionHeader}>
            <h5>
              <FaMapMarkerAlt /> Live Tracking
            </h5>
          </div>

          {deliveries.active.filter((d) => d.status === "IN_TRANSIT").length >
          0 ? (
            <>
              <div className={styles.trackingMap}>
                <LocationTracker
                  deliveryId={
                    deliveries.active.find((d) => d.status === "IN_TRANSIT").id
                  }
                  isWorker={false}
                />
              </div>
              <div className={styles.activeDeliveryInfo}>
                {deliveries.active
                  .filter((d) => d.status === "IN_TRANSIT")
                  .map((delivery) => (
                    <div
                      key={delivery.id}
                      className={styles.trackingDeliveryCard}
                    >
                      <h6>Currently Tracking</h6>
                      <div className={styles.trackingDetails}>
                        <p>
                          <strong>Item:</strong> {delivery.itemName}
                        </p>
                        <p>
                          <strong>Driver:</strong> {delivery.worker_name}
                        </p>
                        <p>
                          <strong>From:</strong> {delivery.pickupCity}
                        </p>
                        <p>
                          <strong>To:</strong> {delivery.deliveryCity}
                        </p>
                        <p className={styles.statusBadge}>
                          {delivery.status_display}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div className={styles.noTracking}>
              <FaTruck size={48} color="#ccc" />
              <p>No active deliveries in transit to track</p>
            </div>
          )}

          <div className={styles.deliveryUpdates}>
            <h5>Recent Updates</h5>
            <div className={styles.updatesList}>
              {getFilteredDeliveries()
                .slice(0, 5)
                .map((delivery) => (
                  <div key={delivery.id} className={styles.updateItem}>
                    <div className={styles.updateTime}>
                      {new Date(delivery.updated_at).toLocaleTimeString()}
                    </div>
                    <div className={styles.updateContent}>
                      <h6>{delivery.itemName}</h6>
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
