import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import axios from 'axios';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import { API_BASE_URL } from '@/constants';
import styles from "@/Components/Payments/Payments.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import Payments from "@/Components/Payments/Payments";
import Loading from "@/Components/UI/Loading";
import { useRouter } from "next/router";
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import DateRangeFilter from '@/Components/UI/DateRangeFilter';
import DataExport from '@/Components/UI/DataExport/DataExport';

const formatLocalDate = (date) => date.toLocaleDateString('en-CA');
const currentMonthRange = () => {
    const today = new Date();
    return [new Date(today.getFullYear(), today.getMonth(), 1), today];
};

function PaymentsPage() {
    const router = useRouter();
    const [payments, setPayments] = useState(null);
    const [allPayments, setAllPayments] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [range, setRange] = useState(currentMonthRange);

    const { t } = useTranslation();

    useEffect(() => {
        if (router.isReady) {
            const startDate = typeof router.query.startDate === 'string' ? new Date(`${router.query.startDate}T00:00:00`) : null;
            const endDate = typeof router.query.endDate === 'string' ? new Date(`${router.query.endDate}T00:00:00`) : null;
            setRange(startDate && endDate ? [startDate, endDate] : currentMonthRange());
        }
    }, [router.isReady, router.query.startDate, router.query.endDate]);

    useEffect(() => {
        if (!router.isReady) return;

        setLoading(true);
        const token = localStorage.getItem('token');
        const [startDate, endDate] = range;
        if (!startDate || !endDate) return;
        const apiUrl = `${API_BASE_URL}/getPayments?startDate=${formatLocalDate(startDate)}&endDate=${formatLocalDate(endDate)}`;
        axios
            .get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then((response) => {
                setAllPayments(response.data.payments);
                setPayments(response.data.payments);
                setSearchTerm(''); // Reset search when new data is loaded
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }, [range, router.isReady]);

    const updateRange = (nextRange) => {
        setRange(nextRange);
        const [startDate, endDate] = nextRange;
        router.push({ pathname: router.pathname, query: startDate && endDate ? { startDate: formatLocalDate(startDate), endDate: formatLocalDate(endDate) } : {} }, undefined, { shallow: true });
    };
    const clearRange = () => updateRange(currentMonthRange());

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (allPayments) {
            if (term.trim() === '') {
                setPayments(allPayments);
            } else {
                const filtered = allPayments.filter(payment =>
                    payment.expense_name && payment.expense_name.toLowerCase().startsWith(term.toLowerCase())
                );
                setPayments(filtered);
            }
        }
    };
    const paymentColumns = [
        { label: t('Expense'), value: 'expense_name' },
        { label: t('Comment'), value: 'comment' },
        { label: t('Date'), value: (payment) => new Date(payment.created_at).toLocaleDateString() },
        { label: t('Payment method'), value: 'payment_method_name' },
        { label: t('Amount'), value: 'amount' },
        { label: t('Currency'), value: (payment) => `${payment.currency_symbol || ''} ${payment.currency_name || ''}`.trim() },
    ];

    return (
        <LayoutApp>
            <Head>
                <title>{`Payments | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('Cash movement')} title={t('Payments')} description={t('Track all your payments and transactions.')} actionHref="/payments/create" actionLabel={t('Add Payment')} secondaryAction={<div className={styles.headerActions}><button type="button" className={styles.filterButton} onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><i className="bi bi-funnel" aria-hidden="true" /> {t('Filter')} <i className={`bi ${filtersOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true" /></button>{payments && <DataExport columns={paymentColumns} filename={`payments-${formatLocalDate(new Date())}.csv`} rows={payments} />}</div>} />
            {filtersOpen && <div className={styles.filtersContainer}>
                <div className={styles.filterField}><label>{t('Date range')}</label><DateRangeFilter value={range} onChange={updateRange} onClear={clearRange} /></div>
                <div className={styles.filterField}>
                    <label htmlFor="searchInput">{t('Search')}</label>
                    <input
                        id="searchInput"
                        className={styles.filterInput}
                        type="text"
                        placeholder={t('Search payment')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>}
            {loading ? (
                <Loading />
            ) : payments && (
                <Payments payments={payments} />
            )}
        </LayoutApp>
    );
}

export default withAuth(PaymentsPage);
