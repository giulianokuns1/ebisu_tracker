import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import styles from './Login.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import { API_AUTH_URL } from '@/constants';
import { useRouter } from 'next/router';
import FormInput from '@/Components/UI/Form/FormInput';
import GoogleAuthButton from '@/Components/Google/GoogleAuthButton';
import Turnstile from '@/Components/UI/Turnstile';

const Login = ({ titleClass }) => {
    const [loginError, setLoginError] = useState(null);
    const [turnstileToken, setTurnstileToken] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({
        email: '',
        password: '',
    });
    const { t } = useTranslation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };
    const router = useRouter();
    const validateForm = () => {
        const newErrors = {};
        if (formData.email.trim() === '') {
            newErrors.email = t('{field} is required', { field: t('Email') });
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = t('Invalid email format');
        }
        if (formData.password.trim() === '') {
            newErrors.password = t('{field} is required', { field: t('Password') });
        } else if (formData.password.length < 8) {
            newErrors.password = t('Password must be at least 8 characters');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const isValidEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            if (!validateForm()) {
                return;
            }
            if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
                throw new Error('Security verification unavailable. Please try again.');
            }
            const response = await axios.post(`${API_AUTH_URL}/login`, {
                ...formData,
                ...(turnstileToken && { turnstileToken })
            }, { withCredentials: true });
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.userData));
                router.replace('/dashboard');
            }
        } catch (error) {
            setLoginError((error.response && error.response.data && error.response.data.message) || error.message || 'Error');
        }
    };
    return (
        <div className={styles.container}>
            <span className={styles.authEyebrow}>{t('Welcome back')}</span>
            <h1 className={`${titleClass || ''} ${styles.containerTitle}`}>{t('Login')}</h1>
            <p className={styles.authSubhead}>{t('Pick up where you left off and stay in control of your money.')}</p>
            <form onSubmit={handleSubmit} className={styles.form}>
                <FormInput
                    label={t('Email')}
                    type={'text'}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    errorMessage={errors.email}
                    customErrorClass={styles.error}
                />
                <FormInput
                    label={t('Password')}
                    type={'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    errorMessage={errors.password}
                    customErrorClass={styles.error}
                    showPasswordToggle
                />
                {loginError && (
                    <div className={`${styles.error}`}>{t(loginError)}</div>
                )}
                <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken('')} onError={() => setTurnstileToken('')} />
                <button type="submit" className={styles.button}>{t('Log In')}</button>
                <div className={styles.notRegisterContainer}>
                    <span>{t('Not registered? ')}</span>
                    <Link href="/register" className={styles.notRegisterCreateAccountLink}>
                        {t('Create an account now')}
                    </Link>
                </div>
                <div>
                    <GoogleAuthButton />
                </div>
            </form>
        </div>
    );
};

export default Login;
