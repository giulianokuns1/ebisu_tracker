import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/Components/Layout/Layout';
import PublicPageSeo from '@/Components/SEO/PublicPageSeo';
import FormInput from '@/Components/UI/Form/FormInput';
import Turnstile from '@/Components/UI/Turnstile';
import { API_AUTH_URL, WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import styles from '@/Components/LoginRegister/LoginRegister.module.scss';
import formStyles from '@/Components/LoginRegister/Login/Login.module.scss';

const isValidEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [step, setStep] = useState('request');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const ensureTurnstile = () => {
        if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
            throw new Error('Security verification unavailable. Please try again.');
        }
    };

    const requestCode = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        if (!isValidEmail(email)) {
            setError('Invalid email format');
            return;
        }

        setIsSubmitting(true);
        try {
            ensureTurnstile();
            const response = await axios.post(`${API_AUTH_URL}/password-reset/request`, {
                email,
                ...(turnstileToken && { turnstileToken }),
            }, { withCredentials: true });
            setMessage(response.data.message);
            setStep('confirm');
        } catch (requestError) {
            setError(requestError.response?.data?.message || requestError.message || 'Error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetPassword = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        if (!/^\d{6}$/.test(code)) {
            setError('Enter the 6-digit code from your email.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsSubmitting(true);
        try {
            ensureTurnstile();
            const response = await axios.post(`${API_AUTH_URL}/password-reset/confirm`, {
                email,
                code,
                password,
                ...(turnstileToken && { turnstileToken }),
            }, { withCredentials: true });
            setMessage(response.data.message);
            window.setTimeout(() => router.replace('/login'), 1800);
        } catch (requestError) {
            setError(requestError.response?.data?.message || requestError.message || 'Error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout showParticles={false} isLogin={true}>
            <PublicPageSeo title={`Reset Password | ${WEBSITE_NAME}`} description="Reset your Ebisu Tracker password." path="/forgot-password" noIndex />
            <div className={styles.pageContainer}>
                <div className={formStyles.container}>
                    <span className={formStyles.authEyebrow}>{t('Account recovery')}</span>
                    <h1 className={formStyles.containerTitle}>{t(step === 'request' ? 'Reset your password' : 'Enter your reset code')}</h1>
                    <p className={formStyles.authSubhead}>
                        {t(step === 'request' ? 'Enter your email and we will send you a 6-digit code.' : `We sent a code to ${email}. It expires in 10 minutes.`)}
                    </p>
                    {step === 'request' ? (
                        <form onSubmit={requestCode} className={formStyles.form}>
                            <FormInput label={t('Email')} type="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                            <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken('')} onError={() => setTurnstileToken('')} />
                            {error && <div className={formStyles.error}>{t(error)}</div>}
                            <button type="submit" className={formStyles.button} disabled={isSubmitting}>{t(isSubmitting ? 'Sending...' : 'Send code')}</button>
                        </form>
                    ) : (
                        <form onSubmit={resetPassword} className={formStyles.form}>
                            <FormInput label={t('Code')} type="text" name="code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} />
                            <FormInput label={t('New password')} type="password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} showPasswordToggle />
                            <FormInput label={t('Confirm password')} type="password" name="confirmPassword" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} showPasswordToggle />
                            <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken('')} onError={() => setTurnstileToken('')} />
                            {error && <div className={formStyles.error}>{t(error)}</div>}
                            {message && <div>{t(message)}</div>}
                            <button type="submit" className={formStyles.button} disabled={isSubmitting}>{t(isSubmitting ? 'Resetting...' : 'Reset password')}</button>
                        </form>
                    )}
                    {step === 'request' && message && <div>{t(message)}</div>}
                    <div className={formStyles.notRegisterContainer}>
                        <Link href="/login" className={formStyles.notRegisterCreateAccountLink}>{t('Back to login')}</Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
