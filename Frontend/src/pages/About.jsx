import React, { useEffect } from "react";
import { FaTruck, FaHandshake, FaUsers, FaShieldAlt } from "react-icons/fa";
import styles from "../css/About.module.css";
import AOS from "aos";
import "aos/dist/aos.css";

const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 2000,
      once: false,
    });
  }, []);
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 data-aos="zoom-in">About SwiftServe</h1>
        <p data-aos="zoom-out">
          Revolutionizing delivery services with speed, reliability, and
          innovation
        </p>
      </section>

      {/* Mission Section */}
      <section className={styles.mission} data-aos="fade-in">
        <div className={styles.missionContent}>
          <h4>Our Mission</h4>
          <p>
            To provide exceptional delivery services that empower businesses and
            delight customers through innovative technology and dedicated
            service.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.values}>
        <h4>Our Core Values</h4>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard} data-aos="fade-in">
            <FaTruck className={styles.icon} />
            <h5>Speed & Efficiency</h5>
            <p>
              We prioritize quick and efficient delivery without compromising
              quality.
            </p>
          </div>
          <div className={styles.valueCard} data-aos="fade-out">
            <FaHandshake className={styles.icon} />
            <h5>Reliability</h5>
            <p>Building trust through consistent and dependable service.</p>
          </div>
          <div className={styles.valueCard} data-aos="fade-in">
            <FaUsers className={styles.icon} />
            <h5>Customer First</h5>
            <p>Your satisfaction drives everything we do.</p>
          </div>
          <div className={styles.valueCard} data-aos="fade-out">
            <FaShieldAlt className={styles.icon} />
            <h5>Security</h5>
            <p>Ensuring the safety of your packages is our priority.</p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className={styles.story}>
        <div className={styles.storyContent}>
          <div className={styles.storyText}>
            <h4>Our Story</h4>
            <p>
              Founded in 2023, SwiftServe began with a simple mission: to
              revolutionize the delivery industry. What started as a small team
              of passionate individuals has grown into a nationwide network of
              dedicated professionals.
            </p>
            <p>
              Today, we're proud to serve thousands of customers, connecting
              businesses with their clients through our innovative delivery
              solutions.
            </p>
          </div>
          <div className={styles.storyImage}>
            <img
              src="https://images.unsplash.com/photo-1494412552100-42e4e7a74ec6"
              alt="Our Journey"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.stat}>
          <h4>10K+</h4>
          <p>Deliveries Completed</p>
        </div>
        <div className={styles.stat}>
          <h4>500+</h4>
          <p>Active Couriers</p>
        </div>
        <div className={styles.stat}>
          <h4>50+</h4>
          <p>Cities Covered</p>
        </div>
        <div className={styles.stat}>
          <h4>98%</h4>
          <p>Customer Satisfaction</p>
        </div>
      </section>
    </div>
  );
};

export default About;
