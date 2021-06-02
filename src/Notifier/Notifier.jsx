import styles from './Notifier.module.css';
import React, { useEffect, useRef } from 'react';

const Notifier = ({ notifications }) => {
  return (
    <div className={styles.container}>
        {notifications.map(({ type, message }) => (
          <div className={styles.toast}>
            <div className={styles.type}>{type}</div>
            <div className={styles.message}>{message}</div>
          </div>
        ))}
    </div>
  )
}

Notifier.defaultProps = {
  hasUpload: true,
}

export default Notifier;