import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import axios from 'axios';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import { API_BASE_URL } from '@/constants';
import styles from "@/Components/Budgets/Budgets.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import Budgets from "@/Components/Budgets/Budgets";
import Loading from "@/Components/UI/Loading";
import Link from "next/link";

function BudgetsPage() {
    const [budgets, setBudgets] = useState(null);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    useEffect(() => {
        const token = localStorage.getItem('token');
        axios
            .get(`${API_BASE_URL}/getBudgets`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then((response) => {
                setBudgets(response.data.budgets);
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
                <title>{`Budgets | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('Spending plans')} title={t('Budgets')} description={t('Set limits and stay on top of category spending.')} />
            <div className={styles.createButtonWrapper}>
                <Link className={styles.budgetsCreateButton} href='/budgets/create' >{t('Add Budget')}</Link>
            </div>
            {loading ? (
                <Loading />
            ) : budgets && (
                <Budgets budgets={budgets} />
            )}
        </LayoutApp>
    );
}

export default withAuth(BudgetsPage);
