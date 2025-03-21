import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import styles from "../css/Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Company Info */}
        <div className={styles.companyInfo}>
          <h4>SwiftServe</h4>
          <p>
            Your trusted delivery partner for quick and reliable courier
            services.
          </p>
          <div className={styles.socialLinks}>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.linksSection}>
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/services">Services</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/tracking">Track Package</Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div className={styles.linksSection}>
          <h4>Services</h4>
          <ul>
            <li>
              <Link to="/courier">Become a Courier</Link>
            </li>
            <li>
              <Link to="/business">Business Solutions</Link>
            </li>
            <li>
              <Link to="/express">Express Delivery</Link>
            </li>
            <li>
              <Link to="/international">International Shipping</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className={styles.contactInfo}>
          <h4>Contact Us</h4>
          <ul>
            <li>Email: support@swiftserve.com</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>Address: 123 Delivery Street</li>
            <li>City, State 12345</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <p>
          &copy; {new Date().getFullYear()} SwiftServe. All rights reserved.
        </p>
        <div className={styles.legal}>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
