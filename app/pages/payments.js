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
import MonthFilter from "@/Components/MonthFilters/MonthFilters";
import YearFilter from "@/Components/YearFilters/YearFilters";
import { useRouter } from "next/router";
import AppPageHeader from '@/Components/Layout/AppPageHeader';

function PaymentsPage() {
    const router = useRouter();
    const [payments, setPayments] = useState(null);
    const [allPayments, setAllPayments] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const getCurrentMonth = () => {
        const month = new Date().getMonth() + 1;
        return month < 10 ? `0${month}` : month.toString();
    };
    const getCurrentYear = () => {
        return new Date().getFullYear().toString();
    };
    const currentMonth = getCurrentMonth();
    const currentYear = getCurrentYear();

    // Get initial values from URL query params or use current date
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const { t } = useTranslation();

    // Update state when URL query params change (e.g., on page load or browser back/forward)
    useEffect(() => {
        if (router.isReady) {
            const urlMonth = router.query.m;
            const urlYear = router.query.y;
            if (urlMonth !== undefined && urlMonth !== null) {
                setSelectedMonth(urlMonth);
            } else {
                setSelectedMonth(getCurrentMonth());
            }
            if (urlYear !== undefined && urlYear !== null) {
                setSelectedYear(urlYear);
            } else {
                setSelectedYear(getCurrentYear());
            }
        }
    }, [router.isReady, router.query.m, router.query.y]);

    useEffect(() => {
        if (!router.isReady) return;

        setLoading(true);
        const token = localStorage.getItem('token');
        const params = [];
        if (selectedMonth) params.push(`m=${selectedMonth}`);
        if (selectedYear) params.push(`y=${selectedYear}`);
        const queryString = params.length > 0 ? `?${params.join('&')}` : '';
        const apiUrl = `${API_BASE_URL}/getPayments${queryString}`;
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
    }, [selectedMonth, selectedYear, router.isReady]);

    const handleMonthChange = (month) => {
        setSelectedMonth(month);
        // Update URL without page reload
        const query = { ...router.query };
        if (month) {
            query.m = month;
        } else {
            delete query.m;
        }
        router.push({
            pathname: router.pathname,
            query: query
        }, undefined, { shallow: true });
    };

    const handleYearChange = (year) => {
        setSelectedYear(year);
        // Update URL without page reload
        const query = { ...router.query };
        if (year) {
            query.y = year;
        } else {
            delete query.y;
        }
        router.push({
            pathname: router.pathname,
            query: query
        }, undefined, { shallow: true });
    };

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

    return (
        <LayoutApp>
            <Head>
                <title>{`Payments | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('Cash movement')} title={t('Payments')} description={t('Track all your payments and transactions.')} actionHref="/payments/create" actionLabel={t('Add Payment')} secondaryAction={<button type="button" className={styles.filterButton} onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><i className="bi bi-funnel" aria-hidden="true" /> {t('Filter')} <i className={`bi ${filtersOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true" /></button>} />
            {filtersOpen && <div className={styles.filtersContainer}>
                <MonthFilter onMonthChange={handleMonthChange} defaultMonth={selectedMonth} />
                <YearFilter onYearChange={handleYearChange} defaultYear={selectedYear} />
                <div className={styles.searchContainer}>
                    <label htmlFor="searchInput" className={styles.searchLabel}>{t('Search')}</label>
                    <input
                        id="searchInput"
                        className={styles.searchInput}
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
