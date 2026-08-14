import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { WEBSITE_NAME } from '@/constants';
import { API_AUTH_URL } from '@/constants';
import Layout from '@/Components/Layout/Layout';
import Login from '@/Components/LoginRegister/Login/Login';
import styles from '@/Components/LoginRegister/LoginRegister.module.scss';
import PublicPageSeo from '@/Components/SEO/PublicPageSeo';
import { useRouter } from 'next/router';

export default function LoginPage() {
    const router = useRouter();
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsCheckingSession(false);
            return;
        }

        axios.get(`${API_AUTH_URL}/check-auth`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
        }).then(({ data }) => {
            if (data.isAuthenticated) {
                router.replace('/dashboard');
                return;
            }

            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsCheckingSession(false);
        }).catch(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsCheckingSession(false);
        });
    }, [router]);

    return (
        <Layout showParticles={false} isLogin={true}>
            <PublicPageSeo title={`Log In | ${WEBSITE_NAME}`} description="Log in to Ebisu Tracker to manage your expenses, payments, savings goals, and personal finance dashboard." path="/login" noIndex />
            <div className={styles.pageContainer}>
                {isCheckingSession ? <div className={styles.sessionLoader} role="status" aria-label="Checking session"><img src="/img/logo3.0-dark-circle.png" alt="" /></div> : <Login />}
            </div>
        </Layout>
    );
}
