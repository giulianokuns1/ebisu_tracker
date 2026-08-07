// Logout.js
import React from 'react';
import axios from 'axios';
import styles from './Logout.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import { API_AUTH_URL } from '@/constants';
import Button from '@/Components/UI/Button';
import { useRouter } from 'next/router';

const Logout = () => {
    const { t } = useTranslation();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await axios.post(`${API_AUTH_URL}/logout`, {}, { withCredentials: true });
        } catch (error) {
            console.error(error);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };
    return (
        <div className={styles.container}>
            <Button customClass={styles.deleteButton} onClick={handleLogout} label={t('Logout')} />
        </div>
    );
};

export default Logout;
