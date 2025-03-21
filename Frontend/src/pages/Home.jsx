import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaShieldAlt, FaClock, FaTruck } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import styles from "../css/Landing.module.css";
import truck from "../assets/courier.png";
import HowItWorks from "../components/HomeComponents/HowItWorks";
import AOS from "aos";
import "aos/dist/aos.css";

const Landing = () => {
  useEffect(() => {
    AOS.init({
      duration: 2000, // Animation duration
      once: false, // Ensures the animation runs only once
    });
  }, []);
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.h1}>Fast & Reliable Courier Services</h1>
          <p>
            Door-to-door delivery solutions that you can trust. Quick, secure,
            and professional service. The service provides you with individual
            in your neighborhood that are ready to deliver your items within few
            kilometers and also trusted courier service within your country
          </p>
          <div className={styles.heroCTA}>
            <Link to="/register" className={styles.primaryButton}>
              Get Started
            </Link>
          </div>
        </div>
        <div className={styles.heroImage} data-aos="zoom-in">
          <img src={truck} alt="truck" />
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h4>Why Choose Us</h4>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard} data-aos="zoom-in">
            <FaShieldAlt className={styles.featureIcon} />
            <h5>Secure Delivery</h5>
            <p>Your packages are fully insured and handled with utmost care</p>
          </div>
          <div className={styles.featureCard} data-aos="zoom-in">
            <FaClock className={styles.featureIcon} />
            <h5>Real-time Tracking</h5>
            <p>Track your deliveries in real-time with our advanced system</p>
          </div>
          <div className={styles.featureCard} data-aos="zoom-in">
            <MdLocationOn className={styles.featureIcon} />
            <h5>Nationwide Coverage</h5>
            <p>Extensive network covering all major cities and regions</p>
          </div>
          <div className={styles.featureCard} data-aos="zoom-in">
            <FaTruck className={styles.featureIcon} />
            <h5>Express Delivery</h5>
            <p>Same-day delivery options for urgent packages</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <h4>How It Works</h4>
        <div className={styles.steps}>
          <div className={styles.step} data-aos="fade-up">
            <div className={styles.stepNumber}>1</div>
            <h5>Register</h5>
            <p>Create your account in minutes</p>
          </div>
          <div className={styles.step} data-aos="fade-down">
            <div className={styles.stepNumber}>2</div>
            <h5>Book</h5>
            <p>Schedule your pickup</p>
          </div>
          <div className={styles.step} data-aos="fade-up">
            <div className={styles.stepNumber}>3</div>
            <h5>Track</h5>
            <p>Monitor delivery progress</p>
          </div>
          <div className={styles.step} data-aos="fade-down">
            <div className={styles.stepNumber}>4</div>
            <h5>Receive</h5>
            <p>Get your package delivered</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta} data-aos="fade-up">
        <h4>Ready to Get Started?</h4>
        <p>
          Join thousands of satisfied customers who trust our delivery service
        </p>
        <div data-aos="zoom-in">
          <Link to="/register" className={styles.primaryButton2}>
            Sign Up Now
          </Link>
        </div>
      </section>

      <section>
        <HowItWorks />
      </section>
    </div>
  );
};

export default Landing;
