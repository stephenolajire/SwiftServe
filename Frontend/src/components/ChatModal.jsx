import React, { useState, useRef, useEffect } from "react";
import { FaCamera, FaPaperPlane, FaTimes } from "react-icons/fa";
import styles from "../css/ChatModal.module.css";
import api from "../constant/api";
import { MEDIA_BASE_URL } from "../constant/api";

const ChatModal = ({ delivery, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages(); // Fetch messages once initially

    // Only set up polling and mark messages as read if delivery is not RECEIVED
    if (delivery.status !== "RECEIVED") {
      markMessagesAsRead();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [delivery.id, delivery.status]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`chat/messages/${delivery.id}/`);
      if (response.data.status === "success") {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markMessagesAsRead = async () => {
    // Only mark messages as read if delivery is not RECEIVED
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

      if (response.data.status === "success") {
        setMessages((prev) => [...prev, response.data.data]);
        setNewMessage("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
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
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.chatHeader}>
          <h4>Chat - {delivery.itemName}</h4>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.messageList}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                msg.sender_type === "CLIENT" ? styles.sent : styles.received
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
              <span className={styles.messageMeta}>
                {msg.sender_name} •{" "}
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className={styles.messageForm}>
          <input
            type="file"
            ref={fileInputRef}
            className={styles.hidden}
            accept="image/*"
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
            disabled={sending}
            className={styles.sendButton}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
