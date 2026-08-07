import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { WEBSITE_NAME, API_BASE_URL } from '@/constants';
import { withAuth } from '@/Hoc/withAuth';
import LayoutApp from '@/Components/Layout/LayoutApp';
import styles from '@/Components/Currencies/Currencies.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import axios from 'axios';
import Currencies from '@/Components/Currencies/Currencies';
import AppPageHeader from '@/Components/Layout/AppPageHeader';

function CurrenciesPage() {
    const { t } = useTranslation();
    const [userCurrencies, setUserCurrencies] = useState([]);
    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/getUserCurrencies`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => {
            setUserCurrencies(response.data.userCurrencies || []);
        });
    }, []);
    return (
        <LayoutApp>
            <Head><title>{`Currencies | ${WEBSITE_NAME}`}</title></Head>
            <AppPageHeader eyebrow="Preferences" title={t('Currencies')} description={t('Manage the currencies you use.')} actionHref="/currencies/create" actionLabel={t('Add Currency')} />
            <Currencies userCurrencies={userCurrencies} />
        </LayoutApp>
    );
}

export default withAuth(CurrenciesPage);
