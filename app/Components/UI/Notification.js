import React, { useEffect, useState } from 'react';
import styles from './Notification.module.scss';
const Notification = ({ message, onClose, type }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, 6000);
        return () => {
            clearTimeout(timer);
        };
    }, [onClose]);

    return visible ? (
        <div className={type === 'success' ? styles.notification : styles.error}>
            <div className={styles.message}>{message}</div>
            <button className={styles.closeButton} onClick={() => setVisible(false)}>X</button>
        </div>
    ) : null;
};

export default Notification;
