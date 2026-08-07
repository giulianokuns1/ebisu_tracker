import React from 'react';
import styles from './HomeFooter.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import Link from 'next/link';

const HomeFooter = () => {
    const { t } = useTranslation();
    return (
        <footer className={styles.footer}>
            <div className={styles.links}>
                <Link href="/privacy-policy" className={styles.link}>{t('Privacy Policy')}</Link>
                <span className={styles.separator}>|</span>
                <Link href="/terms-of-service" className={styles.link}>{t('Terms of Service')}</Link>
            </div>
            <div className={styles.copyright}>
                {t('© 2026 Ebisu Tracker. All rights reserved.')}
            </div>
        </footer>
    );
};

export default HomeFooter;
