import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './HomeHeader.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import HomeHeaderLogin from '@/Components/Home/HomeHeaderLogin';
import { WEBSITE_NAME } from '@/constants';

const HomeHeader = ({ isLogin }) => {
    const { t } = useTranslation();
    return (
        <div>
            {isLogin && <HomeHeaderLogin />}
            {!isLogin && (
                <header className={styles.header}>
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
                    <nav className={styles.navigation} aria-label="Main navigation">
                        <a href="#features">{t('Features')}</a>
                        <a href="#how-it-works">{t('How it Works')}</a>
                    </nav>
                    <div className={styles.loginContainer}>
                        <Link className={styles.loginButton} href="/login">
                            {t('Sign in')}
                        </Link>
                        <Link className={styles.signupButton} href="/register">
                            {t('Sign up free')}
                        </Link>
                    </div>
                </header>
            )}
        </div>
    );
};

export default HomeHeader;
