import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import styles from './Register.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import { API_AUTH_URL, RECAPTCHA_ENABLED, RECAPTCHA_SITE_KEY } from '@/constants';
import FormInput from '@/Components/UI/Form/FormInput';
import { useRouter } from 'next/router';

const Register = ({ titleClass }) => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
    });
    const [registerError, setRegisterError] = useState(null);
    const { t } = useTranslation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateForm();
        setErrors({ ...errors, [name]: '' });
    };

    const validateForm = () => {
        const newErrors = {};
        if (formData.firstname.trim() === '') {
            newErrors.firstname = t('{field} is required', { field: t('First Name') });
        }
        if (formData.lastname.trim() === '') {
            newErrors.lastname = t('{field} is required', { field: t('Last Name') });
        }
        if (formData.email.trim() === '') {
            newErrors.email = t('{field} is required', { field: 'Email' });
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const getCaptchaToken = async () => {
        if (!RECAPTCHA_ENABLED) {
            return null;
        }
        if (!RECAPTCHA_SITE_KEY) {
            throw new Error('Security verification unavailable. Please try again.');
        }
        if (!window.grecaptcha || !window.grecaptcha.execute) {
            throw new Error('Security verification unavailable. Please try again.');
        }
        await new Promise((resolve) => window.grecaptcha.ready(resolve));
        return window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'register' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            const captchaToken = await getCaptchaToken();
            const response = await axios.post(`${API_AUTH_URL}/register`, {
                ...formData,
                ...(RECAPTCHA_ENABLED && { captchaToken, captchaAction: 'register' })
            });
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.userData));
                router.push('/dashboard');
            } else {
                setRegisterError(response.data.message);
            }
        } catch (error) {
            setRegisterError((error.response && error.response.data && error.response.data.message) || error.message || 'Error');
        }
    };
    return (
        <div className={styles.registerContainer}>
            <span className={styles.authEyebrow}>{t('Start for free')}</span>
            <h1 className={`${titleClass || ''} ${styles.containerTitle}`}>{t('Create Account')}</h1>
            <p className={styles.authSubhead}>{t('Build a clearer picture of your finances in just a few minutes.')}</p>
            <form onSubmit={handleSubmit} className={styles.form}>
                <FormInput
                    label={t('First Name')}
                    type={'text'}
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    errorMessage={errors.firstname}
                    customErrorClass={styles.error}
                />
                <FormInput
                    label={t('Last Name')}
                    type={'text'}
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    errorMessage={errors.lastname}
                    customErrorClass={styles.error}
                />
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
                />
                {registerError && (
                    <div className={styles.registerError}>{t(registerError)}</div>
                )}
                <button type="submit" className={styles.button} id="createAccountButton">{t('Create Account')}</button>
                <div className={styles.notRegisterContainer}>
                    <span>{t('Already registered? ')}</span>
                    <Link href="/login" className={styles.notRegisterCreateAccountLink}>
                        {t('Log In')}
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Register;
