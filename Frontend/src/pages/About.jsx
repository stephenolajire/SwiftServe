import React from 'react';
import { FaTruck, FaHandshake, FaUsers, FaShieldAlt } from 'react-icons/fa';
import styles from '../css/About.module.css';

const About = () => {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>About SwiftServe</h1>
        <p>Revolutionizing delivery services with speed, reliability, and innovation</p>
      </section>

      {/* Mission Section */}
      <section className={styles.mission}>
        <div className={styles.missionContent}>
          <h2>Our Mission</h2>
          <p>To provide exceptional delivery services that empower businesses and delight customers through innovative technology and dedicated service.</p>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.values}>
        <h2>Our Core Values</h2>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <FaTruck className={styles.icon} />
            <h3>Speed & Efficiency</h3>
            <p>We prioritize quick and efficient delivery without compromising quality.</p>
          </div>
          <div className={styles.valueCard}>
            <FaHandshake className={styles.icon} />
            <h3>Reliability</h3>
            <p>Building trust through consistent and dependable service.</p>
          </div>
          <div className={styles.valueCard}>
            <FaUsers className={styles.icon} />
            <h3>Customer First</h3>
            <p>Your satisfaction drives everything we do.</p>
          </div>
          <div className={styles.valueCard}>
            <FaShieldAlt className={styles.icon} />
            <h3>Security</h3>
            <p>Ensuring the safety of your packages is our priority.</p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className={styles.story}>
        <div className={styles.storyContent}>
          <div className={styles.storyText}>
            <h2>Our Story</h2>
            <p>Founded in 2023, SwiftServe began with a simple mission: to revolutionize the delivery industry. What started as a small team of passionate individuals has grown into a nationwide network of dedicated professionals.</p>
            <p>Today, we're proud to serve thousands of customers, connecting businesses with their clients through our innovative delivery solutions.</p>
          </div>
          <div className={styles.storyImage}>
            <img src="https://images.unsplash.com/photo-1494412552100-42e4e7a74ec6" alt="Our Journey" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.stat}>
          <h3>10K+</h3>
          <p>Deliveries Completed</p>
        </div>
        <div className={styles.stat}>
          <h3>500+</h3>
          <p>Active Couriers</p>
        </div>
        <div className={styles.stat}>
          <h3>50+</h3>
          <p>Cities Covered</p>
        </div>
        <div className={styles.stat}>
          <h3>98%</h3>
          <p>Customer Satisfaction</p>
        </div>
      </section>
    </div>
  );
};

export default About;