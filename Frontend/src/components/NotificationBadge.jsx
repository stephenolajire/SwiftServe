import React from 'react';
import styles from '../css/NotificationBadge.module.css';

const NotificationBadge = ({ count }) => {
  if (!count) return null;
  return <span className={styles.badge}>{count > 9 ? '9+' : count}</span>;
};

export default NotificationBadge;