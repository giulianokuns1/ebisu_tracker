import React from 'react';
import styles from './AppFooter.module.scss';

const AppFooter = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.security}><i className="bi bi-shield-check" aria-hidden="true" /> Your data is protected.</div>
        </footer>
    );
};

export default AppFooter;
