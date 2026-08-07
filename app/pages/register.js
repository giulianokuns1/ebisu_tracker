import React from 'react';
import { WEBSITE_NAME } from '@/constants';
import Layout from '@/Components/Layout/Layout';
import Register from '@/Components/LoginRegister/Register/Register';
import styles from '@/Components/LoginRegister/LoginRegister.module.scss';
import PublicPageSeo from '@/Components/SEO/PublicPageSeo';

export default function RegisterPage() {
    return (
        <Layout showParticles={false} isLogin={true}>
            <PublicPageSeo title={`Create Your Account | ${WEBSITE_NAME}`} description="Create an Ebisu Tracker account to track expenses, manage payments, build budgets, and reach savings goals." path="/register" noIndex />
            <div className={styles.pageContainer}>
                <Register titleClass={styles.registerTitle} />
            </div>
        </Layout>
    );
}
