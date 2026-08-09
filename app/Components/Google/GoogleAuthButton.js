import { GoogleLogin } from "@react-oauth/google";
import React, { useState } from "react";
import styles from "@/Components/Google/GoogleAuthButton.module.scss";
import axios from "axios";
import { API_AUTH_URL } from "@/constants";
import { useRouter } from "next/router";

const GoogleAuthButton = () => {
    const router = useRouter();
    const [error, setError] = useState('');
    const onLogin = async (credentialResponse) => {
        setError('');
        try {
            const response = await axios.post(`${API_AUTH_URL}/google`, { token: credentialResponse.credential }, { withCredentials: true });
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.userData));
                router.push('/dashboard');
            }
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'Google sign-in could not be completed.');
        }
    }

    return (
        <div className={styles.buttonWrapper}>
            <GoogleLogin
                onSuccess={credentialResponse => {
                    onLogin(credentialResponse);
                }}
                onError={() => {
                    setError('Google sign-in was cancelled or unavailable.');
                }}
                theme={'filled_black'}
                text={'continue_with'}
                shape={'pill'}
                size={'large'}
            />
            {error && <p className={styles.error}>{error}</p>}
        </div>

    );
};

export default GoogleAuthButton;
