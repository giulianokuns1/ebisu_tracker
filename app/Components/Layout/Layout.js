import React from 'react';
import styles from './Layout.module.scss';
import Head from 'next/head';
import { useTranslation } from "@/Hooks/useTranslation";
import { WEBSITE_NAME } from '@/constants';
import HomeHeader from "@/Components/Home/HomeHeader";
import HomeFooter from "@/Components/Home/HomeFooter";
import ParticlesBackground from "@/Components/UI/ParticlesBackground";

export default function Layout({ children, showParticles, isLogin }) {
    const { t } = useTranslation();

    return (
        <div className={styles.appContainer}>
            <Head>
                <title>{WEBSITE_NAME} — Personal finance tracker</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="description" content={`${WEBSITE_NAME} helps you track expenses, manage payments, set budgets, and understand your spending with categories and insights.`} />
            </Head>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.gradientGlow} aria-hidden />
                    <HomeHeader isLogin={isLogin} />
                    <div className={styles.mainContent}>
                        {children}
                    </div>
                    <HomeFooter />
                </div>
                {showParticles && (
                    <ParticlesBackground />
                )}
            </div>
        </div>
    );
}
