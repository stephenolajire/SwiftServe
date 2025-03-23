import React, { useState, useEffect } from "react";
import { FaCheck, FaStar, FaSearch, FaTimes } from "react-icons/fa";
import styles from "../css/Listing.module.css";
import api from "../constant/api";
import Swal from "sweetalert2";
import { MEDIA_BASE_URL } from "../constant/api";

const CourierListings = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [savedItems, setSavedItems] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadingMap, setImageLoadingMap] = useState({});

  useEffect(() => {
    fetchDeliveries();
    return () => {
      setImageLoadingMap({}); // Clean up loading states
    };
  }, []);

  // Helper function to properly format image URLs
  const formatImageUrl = (imageUrl) => {
    if (!imageUrl) return "https://placehold.co/300x300";

    // Check if it's already a complete URL (starts with http:// or https:// or contains cloudinary)
    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://") ||
      imageUrl.includes("res.cloudinary.com")
    ) {
      return imageUrl;
    }

    // Handle paths that might already start with '/'
    const cleanImagePath = imageUrl.startsWith("/")
      ? imageUrl.substring(1)
      : imageUrl;

    // Make sure MEDIA_BASE_URL ends with a slash
    const baseUrl = MEDIA_BASE_URL.endsWith("/")
      ? MEDIA_BASE_URL
      : `${MEDIA_BASE_URL}/`;

    return `${baseUrl}${cleanImagePath}`;
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get("deliveries/");
      console.log("Deliveries:", response.data.data);

      const formattedDeliveries = response.data.data.map((delivery) => {
        setImageLoadingMap((prev) => ({
          ...prev,
          [delivery.id]: true,
        }));

        return {
          id: delivery.id,
          name: delivery.itemName,
          image: formatImageUrl(delivery.itemImage),
          weight: `${delivery.weight} kg`,
          address: delivery.pickupAddress,
          location: `${delivery.pickupCity}, ${delivery.pickupState}`,
          status: delivery.status,
          price: delivery.estimated_price,
          category: delivery.category,
          description: delivery.itemDescription,
          fragile: delivery.fragile,
          recipientName: delivery.recipientName,
          recipientPhone: delivery.recipientPhone,
        };
      });

      setDeliveries(formattedDeliveries);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch available deliveries",
        icon: "error",
        confirmButtonColor: "#007BFF",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (item) => {
    try {
      const response = await api.post(`deliveries/${item.id}/accept/`);

      if (response.data.status === "success") {
        Swal.fire({
          title: "Success",
          text: "Delivery request accepted successfully",
          icon: "success",
          confirmButtonColor: "#007BFF",
        });
        fetchDeliveries(); // Refresh the list
      }
    } catch (error) {
      if (error.response?.data?.message?.includes("active deliveries")) {
        Swal.fire({
          title: "Cannot Accept Delivery",
          text: "Please complete your current delivery before accepting a new one",
          icon: "warning",
          confirmButtonText: "Got it",
          confirmButtonColor: "#FFA500",
          showCancelButton: false,
          allowOutsideClick: false,
          footer: '<a href="/worker/dashboard">Go to Dashboard</a>',
        });
      } else {
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Failed to accept delivery",
          icon: "error",
          confirmButtonColor: "#dc3545",
        });
      }
    }
  };

  const toggleSave = (itemId) => {
    setSavedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Available Deliveries</h1>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading deliveries...</p>
        </div>
      ) : deliveries.length > 0 ? (
        <div className={styles.grid}>
          {deliveries.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.imageContainer}>
                <div className={styles.imageWrapper}>
                  {imageLoadingMap[item.id] && (
                    <div className={styles.imageLoader}>Loading...</div>
                  )}
                  <img
                    src={item.image} // Now using properly formatted URL
                    alt={item.name}
                    className={styles.image}
                    onLoad={() =>
                      setImageLoadingMap((prev) => ({
                        ...prev,
                        [item.id]: false,
                      }))
                    }
                    onError={(e) => {
                      setImageLoadingMap((prev) => ({
                        ...prev,
                        [item.id]: false,
                      }));
                      console.log("Image load error:", item.image);
                      e.target.src = "https://placehold.co/300x300";
                    }}
                  />
                </div>
                <div
                  className={`${styles.status} ${
                    styles[item.status.toLowerCase()]
                  }`}
                >
                  {item.status}
                </div>
              </div>

              <div className={styles.content}>
                <h5 className={styles.itemName}>{item.name}</h5>
                <p className={styles.price}>₦{item.price?.toLocaleString()}</p>

                <div className={styles.actions}>
                  <button
                    onClick={() => handleApply(item)}
                    className={`${styles.actionButton} ${styles.applyButton}`}
                  >
                    <FaCheck />
                    <span>Accept</span>
                  </button>

                  <button
                    onClick={() => setSelectedItem(item)}
                    className={`${styles.actionButton} ${styles.detailsButton}`}
                  >
                    <FaSearch />
                    <span>Details</span>
                  </button>

                  <button
                    onClick={() => toggleSave(item.id)}
                    className={`${styles.saveButton} ${styles.actionButton} ${
                      savedItems.includes(item.id) ? styles.saved : ""
                    }`}
                  >
                    <FaStar />
                    {savedItems.includes(item.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noDeliveries}>
          <p>No deliveries available at the moment</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedItem && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedItem(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedItem(null)}
            >
              <FaTimes />
            </button>

            <div className={styles.modalContent}>
              <div className={styles.imageWrapper}>
                {imageLoadingMap[`modal-${selectedItem.id}`] && (
                  <div className={styles.imageLoader}>Loading...</div>
                )}
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className={styles.modalImage}
                  onLoad={() =>
                    setImageLoadingMap((prev) => ({
                      ...prev,
                      [`modal-${selectedItem.id}`]: false,
                    }))
                  }
                  onError={(e) => {
                    setImageLoadingMap((prev) => ({
                      ...prev,
                      [`modal-${selectedItem.id}`]: false,
                    }));
                    console.log("Modal image load error:", selectedItem.image);
                    e.target.src = "https://placehold.co/300x300";
                  }}
                />
              </div>

              <div className={styles.modalDetails}>
                <h5>{selectedItem.name}</h5>
                <div className={styles.detailsGrid}>
                  <p>
                    <strong>Weight:</strong> {selectedItem.weight}
                  </p>
                  <p>
                    <strong>Price:</strong> ₦
                    {selectedItem.price?.toLocaleString()}
                  </p>
                  <p>
                    <strong>Category:</strong> {selectedItem.category}
                  </p>
                  <p>
                    <strong>Fragile:</strong>{" "}
                    {selectedItem.fragile ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Pickup Address:</strong> {selectedItem.address}
                  </p>
                  <p>
                    <strong>Location:</strong> {selectedItem.location}
                  </p>
                  <p>
                    <strong>Description:</strong> {selectedItem.description}
                  </p>
                </div>

                <button
                  onClick={() => handleApply(selectedItem)}
                  className={styles.modalApplyButton}
                >
                  Accept Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourierListings;
