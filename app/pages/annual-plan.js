import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import Loading from '@/Components/UI/Loading';
import YearFilter from '@/Components/YearFilters/YearFilters';
import { API_BASE_URL, WEBSITE_NAME } from '@/constants';
import { withAuth } from '@/Hoc/withAuth';
import { useTranslation } from '@/Hooks/useTranslation';
import ExpensesPayment from '@/Components/Expenses/ExpensePayment';
import { Dialog } from 'primereact/dialog';
import styles from '@/Components/AnnualPlan/AnnualPlan.module.scss';

const monthNames = Array.from({ length: 12 }, (_, index) => new Date(2026, index, 1).toLocaleDateString('en', { month: 'short' }));
const money = (amount, symbol) => `${symbol || ''} ${Number(amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function AnnualPlanPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [view, setView] = useState('month');
    const [viewSelected, setViewSelected] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [saving, setSaving] = useState('');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    const year = Number(router.query.y) || new Date().getFullYear();
    const load = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/annual-plan?year=${year}`, { headers: { Authorization: `Bearer ${token}` } });
        setData(response.data);
    };
    useEffect(() => {
        if (!router.isReady) return;
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/annual-plan?year=${year}`, { headers: { Authorization: `Bearer ${token}` } })
            .then((response) => { setData(response.data); })
            .catch(() => setData({ expenses: [], totals: [] }));
    }, [router.isReady, year]);
    useEffect(() => {
        if (!settingsOpen) return;
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/getCategories`, { headers: { Authorization: `Bearer ${token}` } })
            .then((response) => setCategories(response.data.categories || []));
    }, [settingsOpen]);
    useEffect(() => {
        const syncView = () => {
            if (!viewSelected) setView(window.innerWidth >= 701 ? 'year' : 'month');
        };
        syncView();
        window.addEventListener('resize', syncView);
        return () => window.removeEventListener('resize', syncView);
    }, [viewSelected]);

    const setYear = (nextYear) => router.push({ pathname: '/annual-plan', query: { y: nextYear } }, undefined, { shallow: true });
    const moveCategory = (index, direction) => setCategories((current) => {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= current.length) return current;
        const next = [...current];
        [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
        return next;
    });
    const saveCategoryOrder = async () => {
        const token = localStorage.getItem('token');
        await axios.post(`${API_BASE_URL}/updateCategoryOrder`, { categoryIds: categories.map((category) => category.id) }, { headers: { Authorization: `Bearer ${token}` } });
        setSettingsOpen(false);
        await load();
    };
    const resetCategoryOrder = () => setCategories((current) => [...current].sort((a, b) => a.name.localeCompare(b.name)));
    const updatePlan = async (expense, cell, value) => {
        const amount = Number(value);
        if (!Number.isFinite(amount) || amount < 0 || !cell.hasPlan) return;
        const key = `${expense.expense_amount_id}:${cell.month}`;
        setSaving(key);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/updateExpenseMonthAmounts`, {
                expenseId: expense.expense_id,
                year,
                month: cell.month,
                amounts: [{ expenseAmountId: expense.expense_amount_id, amount }],
            }, { headers: { Authorization: `Bearer ${token}` } });
            await load();
        } finally {
            setSaving('');
        }
    };

    const cellContent = (expense, cell) => {
        if (!cell.hasPlan && !cell.paid) return <span className={styles.empty}>-</span>;
        const isFutureMonth = year === new Date().getFullYear() && cell.month > new Date().getMonth() + 1;
        const status = cell.remaining === 0 && cell.planned > 0 ? styles.paid : cell.paid > 0 ? styles.partial : isFutureMonth ? styles.future : styles.unpaid;
        const key = `${expense.expense_amount_id}:${cell.month}`;
        return <div className={`${styles.cell} ${status}`}>
            {cell.hasPlan ? <input aria-label={`${expense.name} ${monthNames[cell.month - 1]} planned amount`} defaultValue={cell.planned} inputMode="decimal" onBlur={(event) => updatePlan(expense, cell, event.target.value)} disabled={saving === key} /> : null}
            <ExpensesPayment
                expense={{
                    id: expense.expense_id,
                    name: expense.name,
                    expense_amount_id: expense.expense_amount_id,
                    amount: cell.planned,
                    paymentTotal: cell.paid,
                    currency_symbol: expense.currency_symbol,
                    expense_amounts: [{ id: expense.expense_amount_id, amount: cell.planned, paymentTotal: cell.paid, currency_symbol: expense.currency_symbol }],
                    paymentMethods: data.paymentMethods || [],
                }}
                initialAmount={cell.remaining}
                initialPaymentDate={new Date(year, cell.month - 1, 1)}
                onAddExpensePayment={load}
                renderTrigger={(openPayment) => <button type="button" className={styles.paidButton} onClick={openPayment}>{t('Paid')}: {money(cell.paid, expense.currency_symbol)}</button>}
            />
        </div>;
    };

    if (!data) return <LayoutApp><Loading /></LayoutApp>;
    const monthIndex = selectedMonth - 1;
    const currentMonth = year === new Date().getFullYear() ? new Date().getMonth() + 1 : null;
    return <LayoutApp fullWidth><div className={styles.annualPlanPage}>
        <Head><title>{`Annual Plan | ${WEBSITE_NAME}`}</title></Head>
        <AppPageHeader eyebrow={t('Yearly cash planning')} title={t('Annual Plan')} description={t('Plan monthly expenses, compare what was paid, and track unpaid carry-over.')} />
        <div className={styles.controls}>
            <div className={styles.yearControl}><YearFilter onYearChange={setYear} defaultYear={String(year)} /></div>
            {view === 'month' && <div className={styles.monthPicker}><button onClick={() => setSelectedMonth((month) => month === 1 ? 12 : month - 1)} aria-label={t('Previous month')}><i className="bi bi-chevron-left" /></button><strong>{monthNames[monthIndex]}</strong><button onClick={() => setSelectedMonth((month) => month === 12 ? 1 : month + 1)} aria-label={t('Next month')}><i className="bi bi-chevron-right" /></button></div>}
            <div className={styles.viewToggle}>
                <button className={view === 'month' ? styles.active : ''} onClick={() => { setViewSelected(true); setView('month'); }}>{t('Month')}</button>
                <button className={view === 'year' ? styles.active : ''} onClick={() => { setViewSelected(true); setView('year'); }}>{t('Year')}</button>
            </div>
            <button type="button" className={styles.settingsButton} onClick={() => setSettingsOpen(true)} aria-label={t('Category order')}><i className="bi bi-gear" aria-hidden="true" /></button>
        </div>
        {view === 'month' ? <div className={styles.monthView}>{data.expenses.map((expense) => <article className={styles.monthRow} key={expense.expense_amount_id}><Link href={`/expenses/details/${expense.expense_id}`}><strong><i className={styles.categoryDot} style={{ backgroundColor: expense.category_color || '#809297' }} />{expense.name}</strong><small>{expense.currency_name}</small></Link>{cellContent(expense, expense.cells[monthIndex])}</article>)}<Totals totals={data.totals} monthIndex={monthIndex} /></div> : <div className={styles.planPanel}><div className={styles.yearScroll}><div className={styles.yearGrid}><div className={`${styles.headerCell} ${styles.sticky}`}>{t('Expense')}</div>{monthNames.map((month, index) => <div className={`${styles.headerCell} ${currentMonth === index + 1 ? styles.currentMonth : ''}`} key={month}>{month}</div>)}<div className={styles.headerCell}>{t('Total')}</div>{data.expenses.map((expense) => <React.Fragment key={expense.expense_amount_id}><Link className={`${styles.expenseCell} ${styles.sticky}`} href={`/expenses/details/${expense.expense_id}`}><strong><i className={styles.categoryDot} style={{ backgroundColor: expense.category_color || '#809297' }} />{expense.name}</strong><small>{expense.currency_symbol} · {expense.currency_name}</small></Link>{expense.cells.map((cell) => <div className={`${styles.gridCell} ${currentMonth === cell.month ? styles.currentMonth : ''}`} key={cell.month}>{cellContent(expense, cell)}</div>)}<div className={styles.rowTotal}>{money(expense.cells.reduce((sum, cell) => sum + cell.planned, 0), expense.currency_symbol)}</div></React.Fragment>)}{data.totals.map((currency) => <React.Fragment key={currency.id}><div className={`${styles.totalLabel} ${styles.sticky}`}>{t('Total')} · {currency.symbol}</div>{currency.monthly.map((total) => <div className={`${styles.totalCell} ${currentMonth === total.month ? styles.currentMonth : ''}`} key={total.month}>{money(total.planned, currency.symbol)}</div>)}<div className={styles.totalCell}>{money(currency.monthly.reduce((sum, total) => sum + total.planned, 0), currency.symbol)}</div></React.Fragment>)}</div></div></div>}
        <Dialog header={t('Category order')} visible={settingsOpen} onHide={() => setSettingsOpen(false)} className={styles.categoryOrderDialog} style={{ width: '390px' }} breakpoints={{ '600px': 'calc(100vw - 24px)' }}>
            <p className={styles.dialogIntro}>{t('Choose the category order used across your expense views.')}</p>
            <div className={styles.categoryOrderList}>{categories.map((category, index) => <div className={styles.categoryOrderRow} key={category.id}><span className={styles.categoryDot} style={{ backgroundColor: category.color || '#809297' }} /><strong>{category.name}</strong><div><button type="button" onClick={() => moveCategory(index, -1)} disabled={index === 0} aria-label={t('Move up')}><i className="bi bi-chevron-up" /></button><button type="button" onClick={() => moveCategory(index, 1)} disabled={index === categories.length - 1} aria-label={t('Move down')}><i className="bi bi-chevron-down" /></button></div></div>)}</div>
            <div className={styles.dialogActions}><button type="button" onClick={resetCategoryOrder}>{t('Alphabetical')}</button><button type="button" className={styles.saveOrderButton} onClick={saveCategoryOrder}>{t('Save order')}</button></div>
        </Dialog>
    </div></LayoutApp>;
}

function Totals({ totals, monthIndex }) {
    const { t } = useTranslation();
    return <section className={styles.totals}>{totals.map((currency) => { const total = currency.monthly[monthIndex]; return <div key={currency.id}><h2>{currency.name} ({currency.symbol})</h2><span>{t('Income')}: {money(total.income, currency.symbol)}</span><span>{t('Planned')}: {money(total.planned, currency.symbol)}</span><span>{t('Paid')}: {money(total.paid, currency.symbol)}</span><span>{t('Remaining')}: {money(total.remaining, currency.symbol)}</span><span>{t('Carry-over')}: {money(total.carryOver, currency.symbol)}</span><span>{t('After planned')}: {money(total.availableAfterPlanned, currency.symbol)}</span><span>{t('After paid')}: {money(total.availableAfterPaid, currency.symbol)}</span></div>; })}</section>;
}

export default withAuth(AnnualPlanPage);
