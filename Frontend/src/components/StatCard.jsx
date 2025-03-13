import React from 'react';
import styles from '../css/StatCard.module.css';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className={styles.statCard} style={{ '--stat-color': color }}>
      <div className={styles.statInfo}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.value}>{value}</p>
      </div>
      <div className={styles.iconWrapper} style={{ backgroundColor: `${color}20` }}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;