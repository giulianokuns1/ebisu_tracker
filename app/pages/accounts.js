import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import axios from 'axios';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import { API_BASE_URL } from '@/constants';
import styles from "@/Components/Accounts/Accounts.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import Accounts from "@/Components/Accounts/Accounts";
import Loading from "@/Components/UI/Loading";
import AppPageHeader from '@/Components/Layout/AppPageHeader';

function AccountsPage() {
    const [accounts, setAccounts] = useState(null);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    useEffect(() => {
        const token = localStorage.getItem('token');
        axios
            .get(`${API_BASE_URL}/getAccounts`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then((response) => {
                setAccounts(response.data.accounts);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }, []);

    return (
        <LayoutApp>
            <Head>
                <title>{`Accounts | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow="Financial structure" title={t('Accounts')} description={t('Manage your financial accounts.')} actionHref="/accounts/create" actionLabel={t('Add Account')} />
            {loading ? (
                <Loading />
            ) : accounts && (
                <Accounts accounts={accounts} />
            )}
        </LayoutApp>
    );
}

export default withAuth(AccountsPage);
