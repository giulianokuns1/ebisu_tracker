import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { API_AUTH_URL, API_BASE_URL } from "@/constants";

export const withAuth = (WrappedComponent) => {
    const WithAuthComponent = (props) => {
        const router = useRouter();

        useEffect(() => {
            const token = localStorage.getItem('token');
            axios.get(`${API_AUTH_URL}/check-auth`, {
                withCredentials: true,
                headers: token ? {
                    Authorization: `Bearer ${token}`,
                } : {},
            }).then((response) => {
                if (!response.data.isAuthenticated) {
                    router.push('/login');
                    return;
                }
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (timezone) {
                    axios.post(`${API_BASE_URL}/updateUserData`, { timezone }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
                }
            }).catch((error) => {
                router.push('/login');
                console.log(error);
            });
        }, [router]);

        return <WrappedComponent {...props} />;
    };

    // Set a display name for the HOC
    WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return WithAuthComponent;
};
