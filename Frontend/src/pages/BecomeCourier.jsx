import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserTie, FaBuilding, FaClock, FaMoneyBillWave, FaRoute, FaShieldAlt, FaUsers, FaCar } from 'react-icons/fa';
import styles from '../css/BecomeCourier.module.css';

const BecomeCourier = () => {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>Join SwiftServe as a Courier</h1>
        <p>Choose your path and start earning by delivering with us</p>
      </section>

      {/* Options Section */}
      <section className={styles.options}>
        <div className={styles.optionCard}>
          <div className={styles.optionHeader}>
            <FaUserTie className={styles.optionIcon} />
            <h5>Individual Courier</h5>
          </div>
          <p>Work independently, choose your schedule, and earn money delivering packages</p>
          <ul className={styles.benefits}>
            <li><FaClock /> Flexible Hours</li>
            <li><FaMoneyBillWave /> Competitive Pay</li>
            <li><FaRoute /> Choose Your Area</li>
            <li><FaShieldAlt /> Insurance Coverage</li>
          </ul>
          <div className={styles.requirements}>
            <h5>Requirements:</h5>
            <ul>
              <li>Valid ID/Driver's License</li>
              <li>18+ Years Old</li>
              <li>Smartphone with Internet</li>
              <li>Transportation (Bike/Car)</li>
            </ul>
          </div>
          <Link to="/register" className={styles.registerButton}>
            Register as Individual
          </Link>
        </div>

        <div className={styles.optionCard}>
          <div className={styles.optionHeader}>
            <FaBuilding className={styles.optionIcon} />
            <h5>Company Partnership</h5>
          </div>
          <p>Register your delivery company and expand your business reach</p>
          <ul className={styles.benefits}>
            <li><FaUsers /> Manage Multiple Riders</li>
            <li><FaMoneyBillWave /> Higher Revenue Potential</li>
            <li><FaCar /> Fleet Management</li>
            <li><FaShieldAlt /> Business Insurance</li>
          </ul>
          <div className={styles.requirements}>
            <h5>Requirements:</h5>
            <ul>
              <li>Business Registration</li>
              <li>Fleet Information</li>
              <li>Insurance Documentation</li>
              <li>Tax Registration</li>
            </ul>
          </div>
          <Link to="/company" className={styles.registerButton}>
            Register as Company
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <h4>How It Works</h4>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h5>Register</h5>
            <p>Choose your registration type and complete the application</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h5>Verify</h5>
            <p>Submit required documents for verification</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h5>Training</h5>
            <p>Complete our online training program</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h5>Start Earning</h5>
            <p>Begin accepting delivery requests and earn money</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faq}>
        <h4>Frequently Asked Questions</h4>
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h5>How much do I make ?</h5>
            <p>Earnings vary based on deliveries completed, distance, and time.</p>
          </div>
          <div className={styles.faqItem}>
            <h6>When do I get paid ?</h6>
            <p>We process payments weekly, with direct deposits to your registered bank account.</p>
          </div>
          <div className={styles.faqItem}>
            <h6>What areas can I work ?</h6>
            <p>You can choose your preferred delivery zones within our service areas.</p>
          </div>
          <div className={styles.faqItem}>
            <h6>Do I need insurance ?</h6>
            <p>Yes, we provide basic courier insurance, but additional coverage is recommended.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h4>Ready to Start?</h4>
        <p>Join thousands of successful couriers on SwiftServe</p>
        <div className={styles.ctaButtons}>
          <Link to="/register" className={styles.primaryButton}>
            Register as Individual
          </Link>
          <Link to="/company" className={styles.secondaryButton}>
            Register as Company
          </Link>
        </div>
      </section>
    </div>
  );
};

export default BecomeCourier;