import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import axios from 'axios';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import { API_BASE_URL } from '@/constants';
import styles from '@/Components/Expenses/Expenses.module.scss';
import LayoutApp from '@/Components/Layout/LayoutApp';
import Expenses from "@/Components/Expenses/Expenses";
import Loading from "@/Components/UI/Loading";
import MonthFilter from "@/Components/MonthFilters/MonthFilters";
import AppPageHeader from '@/Components/Layout/AppPageHeader';
function ExpensesPage() {
    const [expenses, setExpenses] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [expensesNextMonth, setExpensesNextMonth] = useState(null);
    const [monthText, setMonthText] = useState('');
    const [nextMonthText, setNextMonthText] = useState('');
    const [expensesAmountByCurrency, setExpensesAmountByCurrency] = useState(null);
    const [data, setData] = useState(null);
    const [showAllChecked, setShowAllChecked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const { t } = useTranslation();

    const getExpenses = async (selectedMonth, showAll = false) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const apiUrl = `${API_BASE_URL}/getExpenses${selectedMonth ? `?m=${selectedMonth}` : ''}${showAll ? '&showAll=T' : ''}`;

        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        setExpenses(response.data.expenses);
        setExpensesNextMonth(response.data.expensesNextMonth);
        setMonthText(response.data.monthText);
        setNextMonthText(response.data.nextMonthText);
        setExpensesAmountByCurrency(response.data.expensesAmountByCurrency);
        setData(response.data);
        setSearchTerm('');
        setLoading(false);
    }

    useEffect(() => {
        getExpenses(selectedMonth);
    }, [selectedMonth]);

    const handleMonthChange = (month) => {
        setSelectedMonth(month);
    };

    useEffect(() => {
        if (!selectedMonth) {
            setSelectedMonth(new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1);
        }
    }, [selectedMonth]);

    const onAddExpensePayment = () => {
        getExpenses(selectedMonth);
    }
    const handleShowAllChange = (e) => {
        let showAll = e.target.value;
        setShowAllChecked(showAll);
        getExpenses(selectedMonth, showAll);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredExpenses = expenses && searchTerm.trim() !== ''
        ? expenses.filter(expense =>
            expense.name && expense.name.toLowerCase().startsWith(searchTerm.toLowerCase())
        )
        : expenses;

    return (
        <LayoutApp>
            <Head>
                <title>{`Expenses | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('Spending ledger')} title={t('Expenses')} description={t('Manage and track all your expenses.')} actionHref="/expenses/create" actionLabel={t('Add Expense')} secondaryAction={<button type="button" className={styles.filterButton} onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><i className="bi bi-funnel" aria-hidden="true" /> {t('Filter')} <i className={`bi ${filtersOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true" /></button>} />
            {filtersOpen && <div className={styles.filtersContainer}>
                <MonthFilter onMonthChange={handleMonthChange} defaultMonth={selectedMonth} displayShowAll={true} onShowAllChange={handleShowAllChange} showAllChecked={showAllChecked} toolbar />
                <div className={styles.searchContainer}>
                    <label htmlFor="expensesSearchInput" className={styles.searchLabel}>{t('Search')}</label>
                    <div className={styles.searchField}><i className="bi bi-search" aria-hidden="true" /><input id="expensesSearchInput" className={styles.searchInput} type="text" placeholder={t('Search expense')} value={searchTerm} onChange={handleSearchChange} />{searchTerm && <button type="button" onClick={() => setSearchTerm('')} aria-label={t('Clear search')}><i className="bi bi-x-lg" aria-hidden="true" /></button>}</div>
                </div>
            </div>}
            {loading ? (
                <Loading />
            ) : filteredExpenses && (
                <Expenses
                    expenses={filteredExpenses}
                    monthText={monthText}
                    expensesAmountByCurrency={expensesAmountByCurrency}
                    data={data}
                    onAddExpensePayment={onAddExpensePayment}
                    showAll={showAllChecked}
                />
            )}
        </LayoutApp>
    );
}

export default withAuth(ExpensesPage);
