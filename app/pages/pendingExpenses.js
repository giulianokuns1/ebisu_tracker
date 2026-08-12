import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import axios from 'axios';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import { API_BASE_URL } from '@/constants';
import styles from "@/Components/Expenses/Expenses.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import PendingExpenses from "@/Components/PendingExpenses/PendingExpenses";
import Loading from "@/Components/UI/Loading";
import AppPageHeader from '@/Components/Layout/AppPageHeader';

function PendingExpensesPage() {
    const [pendingExpenses, setPendingExpenses] = useState(null);
    const [paidExpenses, setPaidExpenses] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('pending');
    const { t } = useTranslation();
    useEffect(() => {
        fetchExpensesData();
    }, []);
    const fetchExpensesData = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios
            .get(`${API_BASE_URL}/getPendingExpenses`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then((response) => {
                setPendingExpenses(response.data.pendingExpenses);
                setPaidExpenses(response.data.paidExpenses);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    };

    const handleAddExpensePayment = () => {
        fetchExpensesData();
    }
    return (
        <LayoutApp>
            <Head>
                <title>{`Pending Expenses | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('Attention needed')} title={t('Pending Expenses')} description={t('Review and manage outstanding expenses.')} secondaryAction={<button type="button" className={styles.filterButton} onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><i className="bi bi-funnel" aria-hidden="true" /> {t('Filter')} <i className={`bi ${filtersOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true" /></button>} />
            {filtersOpen && <div className={styles.filtersContainer}><div className={styles.pendingFilterTabs}><button type="button" className={statusFilter === 'pending' ? styles.activePendingFilter : ''} onClick={() => setStatusFilter('pending')}>{t('Pending')} ({pendingExpenses?.length || 0})</button><button type="button" className={statusFilter === 'paid' ? styles.activePendingFilter : ''} onClick={() => setStatusFilter('paid')}>{t('Paid')} ({paidExpenses?.length || 0})</button><button type="button" className={statusFilter === 'all' ? styles.activePendingFilter : ''} onClick={() => setStatusFilter('all')}>{t('All')}</button></div></div>}
            {loading ? (
                <Loading />
            ) : (
                <>
                    {pendingExpenses && (statusFilter === 'pending' || statusFilter === 'all') && (
                        <PendingExpenses expenses={pendingExpenses} onAddExpensePayment={handleAddExpensePayment}/>
                    )}
                    {paidExpenses && (statusFilter === 'paid' || statusFilter === 'all') && (
                        <PendingExpenses expenses={paidExpenses} onAddExpensePayment={handleAddExpensePayment} />
                    )}
                </>
            )}
        </LayoutApp>
    );
}

export default withAuth(PendingExpensesPage);
