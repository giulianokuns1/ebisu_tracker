import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import axios from 'axios';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import { API_BASE_URL } from '@/constants';
import styles from "@/Components/PaymentMethods/PaymentMethods.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import PaymentMethods from "@/Components/PaymentMethods/PaymentMethods";
import Loading from "@/Components/UI/Loading";
import AppPageHeader from '@/Components/Layout/AppPageHeader';

function PaymentMethodsPage() {
    const [paymentMethods, setPaymentMethods] = useState(null);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    useEffect(() => {
        const token = localStorage.getItem('token');
        axios
            .get(`${API_BASE_URL}/getPaymentMethods`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then((response) => {
                setPaymentMethods(response.data.paymentMethods);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }, []);

    const addCategory = (newCategory) => {
        setPaymentMethods([...paymentMethods, newCategory]);
    };

    return (
        <LayoutApp>
            <Head>
                <title>{`Payment Methods | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('Payment setup')} title={t('Payment Methods')} description={t('Manage how you pay your expenses.')} actionHref="/paymentMethods/create" actionLabel={t('Add Method')} />
            {loading ? (
                <Loading />
            ) : paymentMethods && (
                <PaymentMethods paymentMethods={paymentMethods} />
            )}
        </LayoutApp>
    );
}

export default withAuth(PaymentMethodsPage);
