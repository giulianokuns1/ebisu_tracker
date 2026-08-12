import React from 'react';
import styles from './AppFooter.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';

const AppFooter = () => {
    const { t } = useTranslation();
    return (
        <footer className={styles.footer}>
            <div className={styles.security}><i className="bi bi-shield-check" aria-hidden="true" /> {t('Your data is protected.')}</div>
        </footer>
    );
};

export default AppFooter;
