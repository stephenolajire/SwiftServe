import React, { useState, useEffect } from "react";
import {
  FaBox,
  FaTruck,
  FaMoneyBillWave,
  FaStar,
  FaRoute,
  FaCheckCircle,
  FaComment,
} from "react-icons/fa";
import styles from "../css/WorkerDashboard.module.css";
import ChatVerification from "../components/ChatVerification";
import NotificationBadge from "../components/NotificationBadge";
import api from "../constant/api";
import Swal from "sweetalert2";
import LocationTracker from "../components/LocationTracker";

const WorkerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [deliveries, setDeliveries] = useState({
    pending: [],
    active: [],
    completed: [],
  });
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
  });
  const [worker, setWorker] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    // Initial data fetch
    fetchWorkerData();

    // Message checking interval
    const messageCheckInterval = setInterval(checkNewMessages, 5000);

    // Cleanup function
    return () => {
      clearInterval(messageCheckInterval);
    };
  }, []); // Empty dependency array for initial mount only

  // Separate useEffect for message checking
  useEffect(() => {
    if (deliveries.active.length === 0 && deliveries.pending.length === 0) {
      return; // Don't check messages if no active/pending deliveries
    }

    checkNewMessages();
  }, [deliveries.active, deliveries.pending]);

  const fetchWorkerData = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("deliveries/worker/");

      setWorker((prev) => {
        const newWorker = response.data.data.worker;
        return JSON.stringify(prev) === JSON.stringify(newWorker)
          ? prev
          : newWorker;
      });

      const deliveriesData = response.data.data.deliveries || [];

      setDeliveries((prev) => {
        const organized = {
          pending: deliveriesData.filter((d) => d.status === "PENDING"),
          active: deliveriesData.filter((d) =>
            ["ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"].includes(
              d.status
            )
          ),
          completed: deliveriesData.filter((d) => d.status === "RECEIVED"),
        };

        return JSON.stringify(prev) === JSON.stringify(organized)
          ? prev
          : organized;
      });

      setEarnings((prev) => {
        const newEarnings = {
          today: response.data.data.earnings.today || 0,
          week: response.data.data.earnings.week || 0,
          month: response.data.data.earnings.month || 0,
        };
        return JSON.stringify(prev) === JSON.stringify(newEarnings)
          ? prev
          : newEarnings;
      });
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load deliveries",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Modify the checkNewMessages function
  const checkNewMessages = React.useCallback(async () => {
    try {
      const activeDeliveries = [
        ...deliveries.active,
        ...deliveries.pending,
      ].filter((d) => d.status !== "RECEIVED");

      if (activeDeliveries.length === 0) {
        setUnreadMessages({});
        return;
      }

      const response = await api.get("deliveries/messages/unread/");

      if (response.data.status === "success") {
        setUnreadMessages((prev) => {
          const newMessages = { ...prev };
          let hasChanged = false;

          Object.entries(response.data.data).forEach(([deliveryId, count]) => {
            if (newMessages[deliveryId] !== count) {
              newMessages[deliveryId] = count;
              hasChanged = true;
            }
          });

          return hasChanged ? newMessages : prev;
        });
      }
    } catch (error) {
      console.error("Error checking messages:", error);
    }
  }, [deliveries.active, deliveries.pending]);

  const renderDeliveryList = () => {
    const currentDeliveries = deliveries[activeTab] || [];

    if (loading) {
      return <div className={styles.loading}>Loading deliveries...</div>;
    }

    if (currentDeliveries.length === 0) {
      return (
        <div className={styles.noData}>No {activeTab} deliveries found</div>
      );
    }

    return (
      <div className={styles.deliveryGrid}>
        {currentDeliveries.map((delivery) => renderDeliveryCard(delivery))}
      </div>
    );
  };

  const renderDeliveryCard = (delivery) => (
    <div key={delivery.id} className={styles.deliveryCard}>
      <div className={styles.deliveryHeader}>
        <h5>{delivery.itemName}</h5>
        <div className={styles.headerActions}>
          <span
            className={`${styles.statuss} ${
              styles[delivery.status.toLowerCase()]
            }`}
          >
            {delivery.status}
          </span>
        </div>
      </div>

      <div className={styles.deliveryDetails}>
        <p>
          <strong>From:</strong> {delivery.pickupAddress}
        </p>
        <p>
          <strong>To:</strong> {delivery.deliveryAddress}
        </p>
        <p>
          <strong>Distance:</strong> {delivery.distance_covered?.toFixed(2)} km
        </p>
        <p>
          <strong>Current Price:</strong> ₦
          {delivery.estimated_price?.toLocaleString()}
        </p>
      </div>

      <div className={styles.deliveryActions}>
        {delivery.status === "ACCEPTED" && (
          <>
            <button
              onClick={() => handlePickupVerification(delivery)}
              className={styles.actionButton}
            >
              Chat with Client
              {unreadMessages[delivery.id] > 0 && (
                <NotificationBadge count={unreadMessages[delivery.id]} />
              )}
            </button>
            <button
              onClick={() => handleStartDelivery(delivery)}
              className={`${styles.actionButton} ${styles.startDeliveryButton}`}
            >
              Start Delivery
            </button>
          </>
        )}
        {delivery.status === "IN_TRANSIT" && (
          <button
            onClick={() => handleCompleteDelivery(delivery)}
            className={`${styles.actionButton} ${styles.completeButton}`}
          >
            Complete Delivery
          </button>
        )}
      </div>
    </div>
  );

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      await api.post(`deliveries/${deliveryId}/update-status/`, {
        status: newStatus,
      });

      // Show loading while fetching updated data
      Swal.fire({
        title: "Updating...",
        text: "Please wait while we update the delivery status",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      await fetchWorkerData(); // Refresh the data

      Swal.fire({
        title: "Success",
        text: "Delivery status updated successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating delivery status:", error);
      Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message || "Failed to update delivery status",
        icon: "error",
      });
    }
  };

  const handlePickupVerification = (delivery) => {
    setSelectedDelivery(delivery);
    // Clear unread count when opening chat
    setUnreadMessages((prev) => ({
      ...prev,
      [delivery.id]: 0,
    }));
  };

  const handleStartDelivery = (delivery) => {
    Swal.fire({
      title: "Verification Check",
      text: "Have you chatted with the client and confirmed the correct items?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, items verified",
      cancelButtonText: "No, need to verify",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#dc3545",
    }).then((result) => {
      if (result.isConfirmed) {
        updateDeliveryStatus(delivery.id, "IN_TRANSIT");
      } else {
        handlePickupVerification(delivery);
      }
    });
  };

  const handleCompleteDelivery = (delivery) => {
    Swal.fire({
      title: "Complete Delivery",
      text: "Are you sure you want to mark this delivery as completed?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, complete it",
      cancelButtonText: "No, cancel",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#dc3545",
    }).then((result) => {
      if (result.isConfirmed) {
        updateDeliveryStatus(delivery.id, "DELIVERED");
      }
    });
  };

  const handleVerificationComplete = async () => {
    // Update delivery status after verification
    try {
      await api.post(`deliveries/${selectedDelivery.id}/update-status/`, {
        status: "PICKED_UP",
      });

      // Refresh deliveries
      fetchWorkerData();
      setSelectedDelivery(null);
    } catch (error) {
      console.error("Error updating delivery status:", error);
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h4>Welcome {worker?.firstName || "Worker"}</h4>
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
            <h5>Pending Deliveries</h5>
            <p>{deliveries.pending.length}</p>
          </div>
        </div>

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
            <FaMoneyBillWave />
          </div>
          <div className={styles.statInfo}>
            <h5>Today's Earnings</h5>
            <p>₦{earnings.today.toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaStar />
          </div>
          <div className={styles.statInfo}>
            <h5>Rating</h5>
            <p>{worker?.rating || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.deliveriesSection}>
          <div className={styles.sectionHeader}>
            <h5>Current Deliveries</h5>
            <div className={styles.deliveryTabs}>
              {["active", "pending", "completed"].map((tab) => (
                <button
                  key={tab}
                  className={`${styles.tabButton} ${
                    activeTab === tab ? styles.activeTab : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {renderDeliveryList()}
        </div>

        <div className={styles.routeSection}>
          <h5>Current Location</h5>
          <div className={styles.map}>
            {activeTab === "active" && deliveries.active.length > 0 && (
              <LocationTracker
                deliveryId={deliveries.active[0].id}
                isWorker={true}
              />
            )}
          </div>
        </div>
      </div>

      {selectedDelivery && (
        <ChatVerification
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
          onVerificationComplete={handleVerificationComplete}
        />
      )}
    </div>
  );
};

export default WorkerDashboard;
