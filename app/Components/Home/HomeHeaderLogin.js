import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './HomeHeaderLogin.module.scss';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';

const HomeHeaderLogin = () => {
    const { t } = useTranslation();
    return (
        <div className={styles.header}>
            <Link href="/" className={styles.logoBrand}>
                <div className={styles.logoBox}>
                    <Image
                        src="/img/logo3.0-removebg-preview.png"
                        alt={WEBSITE_NAME}
                        width={46}
                        height={46}
                        className={styles.logoImg}
                    />
                </div>
                <span className={styles.brandName}>{WEBSITE_NAME}<small>{t('Expense tracker')}</small></span>
            </Link>
        </div>
    );
};

export default HomeHeaderLogin;
