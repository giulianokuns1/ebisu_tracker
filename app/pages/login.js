import React from 'react';
import { WEBSITE_NAME } from '@/constants';
import Layout from '@/Components/Layout/Layout';
import Login from '@/Components/LoginRegister/Login/Login';
import styles from '@/Components/LoginRegister/LoginRegister.module.scss';
import PublicPageSeo from '@/Components/SEO/PublicPageSeo';

export default function LoginPage() {
    return (
        <Layout showParticles={false} isLogin={true}>
            <PublicPageSeo title={`Log In | ${WEBSITE_NAME}`} description="Log in to Ebisu Tracker to manage your expenses, payments, savings goals, and personal finance dashboard." path="/login" noIndex />
            <div className={styles.pageContainer}>
                <Login />
            </div>
        </Layout>
    );
}
