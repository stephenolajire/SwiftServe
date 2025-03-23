import React, { useState, useRef, useEffect } from "react";
import { FaCamera, FaPaperPlane, FaTimes } from "react-icons/fa";
import styles from "../css/ChatVerification.module.css";
import api from "../constant/api";
import { MEDIA_BASE_URL } from "../constant/api";

const ChatVerification = ({ delivery, onClose, onVerificationComplete }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const fileInputRef = useRef(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get(`chat/messages/${delivery.id}/`);
        setMessages(response.data.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    // Only set up polling if delivery is not in RECEIVED status
    if (delivery.status !== "RECEIVED") {
      fetchMessages();
      markMessagesAsRead();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    } else {
      // For RECEIVED deliveries, fetch messages once without polling
      fetchMessages();
    }
  }, [delivery.id, delivery.status]);

  // Also update markMessagesAsRead to only run when not RECEIVED
  const markMessagesAsRead = async () => {
    if (delivery.status !== "RECEIVED") {
      try {
        await api.post(`deliveries/${delivery.id}/mark-read/`);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !fileInputRef.current?.files?.[0]) return;

    try {
      setSending(true);
      const formData = new FormData();

      if (newMessage) {
        formData.append("message", newMessage);
      }

      if (fileInputRef.current?.files?.[0]) {
        formData.append("image", fileInputRef.current.files[0]);
      }

      formData.append("delivery_id", delivery.id);
      formData.append("type", "VERIFICATION");

      const response = await api.post("chat/messages/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessages((prev) => [...prev, response.data.data]);
      setNewMessage("");
      fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${MEDIA_BASE_URL}${imageUrl}`;
  };

  return (
    <div className={styles.chatOverlay}>
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <h3>Item Verification - {delivery.itemName}</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.messageList}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                msg.sender_type === "WORKER" ? styles.sent : styles.received
              }`}
            >
              {msg.image && (
                <img
                  src={getImageUrl(msg.image)}
                  alt="Message attachment"
                  className={styles.messageImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/300?text=Image+Failed+to+Load";
                  }}
                />
              )}
              {msg.message && <p>{msg.message}</p>}
              <span className={styles.timestamp}>
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className={styles.messageForm}>
          <div className={styles.inputContainer}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className={styles.hidden}
              id="imageInput"
            />
            <label htmlFor="imageInput" className={styles.cameraButton}>
              <FaCamera />
            </label>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className={styles.messageInput}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={sending}
            >
              <FaPaperPlane />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatVerification;
