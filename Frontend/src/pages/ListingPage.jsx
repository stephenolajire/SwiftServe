import React, { useState } from "react";
import { FaCheck, FaStar, FaSearch, FaTimes } from "react-icons/fa";
import styles from "../css/Listing.module.css";

const CourierListings = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [savedItems, setSavedItems] = useState([]);

  // Mock data - replace with your API data
  const items = [
    {
      id: 1,
      name: "Electronics Package",
      image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc",
      weight: "2.5 kg",
      address: "123 Tech Street, Digital District",
      location: "Shop 15, Digital Mall",
      status: "Available",
    },
    {
      id: 2,
      name: "Fresh Food Delivery",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352",
      weight: "1.8 kg",
      address: "45 Foodie Lane, Culinary Corner",
      location: "Restaurant Zone, Block B",
      status: "Urgent",
    },
    {
      id: 3,
      name: "Fashion Package",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2",
      weight: "0.8 kg",
      address: "789 Style Avenue",
      location: "Fashion Hub, Level 2",
      status: "Available",
    },
    {
      id: 4,
      name: "Medical Supplies",
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f",
      weight: "3.2 kg",
      address: "456 Health Street",
      location: "Medical Center, Wing A",
      status: "Priority",
    },
    {
      id: 5,
      name: "Book Collection",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
      weight: "4.5 kg",
      address: "321 Reader's Lane",
      location: "Library Complex, Room 101",
      status: "Available",
    },
    {
      id: 6,
      name: "Sports Equipment",
      image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5",
      weight: "5.0 kg",
      address: "159 Athletics Road",
      location: "Sports Center, Locker 24",
      status: "Express",
    },
    {
      id: 7,
      name: "Art Supplies",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
      weight: "1.2 kg",
      address: "753 Creative Street",
      location: "Art Studio, Unit 7",
      status: "Available",
    },
    {
      id: 8,
      name: "Home Decor Items",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
      weight: "3.7 kg",
      address: "852 Interior Avenue",
      location: "Decor Mall, Shop 32",
      status: "Fragile",
    },
    {
      id: 9,
      name: "Office Supplies",
      image: "https://images.unsplash.com/photo-1497032205916-ac775f0649ae",
      weight: "2.9 kg",
      address: "951 Business Boulevard",
      location: "Office Tower, Floor 15",
      status: "Available",
    },
    {
      id: 10,
      name: "Gift Package",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48",
      weight: "1.5 kg",
      address: "357 Celebration Road",
      location: "Gift Center, Kiosk 5",
      status: "Express",
    },
  ];

  const toggleSave = (itemId) => {
    setSavedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleApply = (item) => {
    // Implement apply logic
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Available Deliveries</h1>

      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <img src={item.image} alt={item.name} className={styles.image} />
              <div className={styles.status}>{item.status}</div>
            </div>

            <div className={styles.content}>
              <h2 className={styles.itemName}>{item.name}</h2>

              <div className={styles.actions}>
                <button
                  onClick={() => handleApply(item)}
                  className={`${styles.actionButton} ${styles.applyButton}`}
                >
                  <FaCheck />
                  <span>Apply</span>
                </button>

                <button
                  onClick={() => toggleSave(item.id)}
                  className={`${styles.actionButton} ${styles.saveButton} ${
                    savedItems.includes(item.id) ? styles.saved : ""
                  }`}
                >
                  <FaStar />
                  <span>Save</span>
                </button>

                <button
                  onClick={() => setSelectedItem(item)}
                  className={`${styles.actionButton} ${styles.detailsButton}`}
                >
                  <FaSearch />
                  <span>Details</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className={styles.modalImage}
              />

              <div className={styles.modalDetails}>
                <h2>{selectedItem.name}</h2>
                <p>
                  <strong>Weight:</strong> {selectedItem.weight}
                </p>
                <p>
                  <strong>Pickup Address:</strong> {selectedItem.address}
                </p>
                <p>
                  <strong>Location:</strong> {selectedItem.location}
                </p>

                <button
                  onClick={() => handleApply(selectedItem)}
                  className={styles.modalApplyButton}
                >
                  Request Pickup
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
