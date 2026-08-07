import { GoogleLogin } from "@react-oauth/google";
import React from "react";
import styles from "@/Components/Google/GoogleAuthButton.module.scss";
import axios from "axios";
import { API_AUTH_URL } from "@/constants";
import { useRouter } from "next/router";

const GoogleAuthButton = () => {
    const router = useRouter();
    const onLogin = async (credentialResponse) => {
        // const decodedToken = jwtDecode(credentialResponse.credential);
        try {
            const response = await axios.post(`${API_AUTH_URL}/google`, { token: credentialResponse.credential }, { withCredentials: true });
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.userData));
                router.push('/dashboard');
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className={styles.buttonWrapper}>
            <GoogleLogin
                onSuccess={credentialResponse => {
                    onLogin(credentialResponse);
                }}
                onError={() => {
                    console.log('Login Failed');
                }}
                theme={'filled_black'}
                text={'continue_with'}
                shape={'pill'}
                size={'large'}
            />
        </div>

    );
};

export default GoogleAuthButton;
