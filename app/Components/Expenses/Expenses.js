import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import styles from './ExpensesWorkspace.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';

ChartJS.register(ArcElement, Tooltip, Legend);

const categoryColors = ['#4fd6be', '#8c63f5', '#f29b4b', '#f4cf43', '#48b7de'];

const Expenses = ({ expenses, monthText, data }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const currencies = Object.entries(data.totalAmountByCurrency || {});
    const [currencyId, setCurrencyId] = useState(currencies[0]?.[0] || '');
    const [status, setStatus] = useState('all');
    const activeCurrencyId = currencies.some(([id]) => id === currencyId) ? currencyId : currencies[0]?.[0] || '';
    const currency = data.totalAmountByCurrency?.[activeCurrencyId]?.currency || {};
    const total = Number(data.totalAmountByCurrency?.[activeCurrencyId]?.amount || 0);
    const categoryFallback = expenses.filter((expense) => String(expense.currency_id) === String(activeCurrencyId)).reduce((summary, expense) => {
        const key = expense.category_id || 'other';
        if (!summary[key]) summary[key] = { id: key, name: expense.category_name || 'Other', icon: expense.category_icon || 'bi bi-three-dots', color: expense.category_color || '#4FD6BE', amount: 0, count: 0, currency_symbol: expense.currency_symbol };
        summary[key].amount += Number(expense.amount) || 0;
        summary[key].count += 1;
        return summary;
    }, {});
    const categories = data.categorySummaryByCurrency?.[activeCurrencyId]?.length ? data.categorySummaryByCurrency[activeCurrencyId] : Object.values(categoryFallback).sort((a, b) => b.amount - a.amount);
    const format = (amount) => new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(amount) || 0);
    const isPaid = (expense) => Boolean(expense.isFullPaid) || Number(expense.paymentTotal || 0) >= Number(expense.amount || 0);
    const visibleExpenses = expenses.filter((expense) => status === 'all' || (status === 'paid' ? isPaid(expense) : !isPaid(expense)));
    const statusCount = (targetStatus) => expenses.filter((expense) => targetStatus === 'paid' ? isPaid(expense) : !isPaid(expense)).length;
    return (
        <div className={styles.workspace}>
            <section className={styles.metricGrid} aria-label={t('Expense summary')}>
                <Metric icon="bi-receipt" tone="total" title={t('Total Expenses')} values={currencies.map(([id, item]) => ({ id, currency: item.currency, amount: item.amount }))} format={format} />
                <Metric icon="bi-check2-circle" tone="paid" title={t('Paid')} values={currencies.map(([id, item]) => ({ id, currency: item.currency, amount: data.amountPaidByCurrency?.[id] || 0 }))} format={format} />
                <Metric icon="bi-clock-history" tone="pending" title={t('Pending')} values={currencies.map(([id, item]) => ({ id, currency: item.currency, amount: data.amountPendingByCurrency?.[id] || 0 }))} format={format} />
                <Metric icon="bi-graph-up-arrow" tone="average" title={t('This Month Avg/Day')} values={currencies.map(([id, item]) => ({ id, currency: item.currency, amount: data.daysInMonth ? Number(item.amount || 0) / data.daysInMonth : 0 }))} format={format} />
            </section>

            <section className={styles.overviewGrid}>
                {currencies.map(([id, item]) => <article className={`${styles.panel} ${styles.overviewPanel}`} key={id}>
                    <PanelTitle eyebrow={t('Expenses Overview')} title={`${t(monthText)} · ${item.currency?.name || ''}`} />
                    <div className={styles.doughnutLayout}>
                        <Overview currency={item.currency || {}} total={Number(item.amount || 0)} paid={Number(data.amountPaidByCurrency?.[id] || 0)} pending={Number(data.amountPendingByCurrency?.[id] || 0)} format={format} paidLabel={t('Paid')} pendingLabel={t('Pending')} totalLabel={t('Total')} />
                    </div>
                </article>)}
                <article className={`${styles.panel} ${styles.categoryPanel}`}>
                    <PanelTitle eyebrow={t('Expenses by Category')} title={t('Scheduled allocation')} />
                    <div className={styles.categoryContent}><div className={styles.categoryList}>{categories.slice(0, 5).map((category, index) => { const color = category.color || categoryColors[index]; return <div className={styles.categoryRow} key={category.id}><span className={styles.categoryIcon} style={{ color }}><i className={category.icon} aria-hidden="true" /></span><strong>{t(category.name)}</strong><div className={styles.categoryRail}><span style={{ background: color, width: `${total ? (category.amount / total) * 100 : 0}%` }} /></div><b>{category.currency_symbol} {format(category.amount)}</b><small>{total ? ((category.amount / total) * 100).toFixed(1) : 0}%</small></div>; })}</div><div className={styles.transactionCount}>{data.totalEntries || 0}<span>{t('Transactions')}</span></div></div>
                </article>
            </section>

            <section className={styles.listPanel}>
                <div className={styles.listHeader}><div><p>{t('Expenses List')}</p><span>{t('Showing')} {visibleExpenses.length} {t('of')} {expenses.length} {t('entries')}</span></div><div className={styles.tabs}>{[['all', t('All')], ['paid', t('Paid')], ['pending', t('Pending')]].map(([key, label]) => <button key={key} type="button" onClick={() => setStatus(key)} className={status === key ? styles.activeTab : ''}>{label}{key !== 'all' && <small>{statusCount(key)}</small>}</button>)}</div></div>
                {visibleExpenses.length ? <div className={styles.table} role="table"><div className={`${styles.tableRow} ${styles.tableHead}`} role="row"><span>{t('Due Date')}</span><span>{t('Description')}</span><span>{t('Category')}</span><span>{t('Amount')}</span><span>{t('Status')}</span><span>{t('Actions')}</span></div>{visibleExpenses.map((expense) => <button key={`${expense.id}-${expense.expense_amount_id}`} type="button" className={styles.tableRow} onClick={() => router.push(`/expenses/details/${expense.id}`)}><span>{t(expense.formattedGridDueDate)}</span><span className={styles.description}><i className={expense.category_icon || 'bi bi-receipt'} aria-hidden="true" />{t(expense.name)}</span><span className={styles.categoryChip}><i className={styles.categoryDot} style={{ backgroundColor: expense.category_color || '#809297' }} />{t(expense.category_name || 'Other')}</span><span className={isPaid(expense) ? styles.paidAmount : styles.pendingAmount}>{expense.currency_symbol} {format(expense.amount)}</span><span className={isPaid(expense) ? styles.paidStatus : styles.pendingStatus}>{isPaid(expense) ? t('Paid') : t('Pending')}</span><span className={styles.edit}><i className="bi bi-pencil" aria-hidden="true" /><span className="visually-hidden">{t('Edit')}</span></span></button>)}</div> : <div className={styles.emptyState}><i className="bi bi-receipt" aria-hidden="true" /><strong>{t('No expenses to show.')}</strong><span>{t('Add an expense or change the selected filters.')}</span></div>}
            </section>
        </div>
    );
};

const Metric = ({ icon, tone, title, values, format }) => <article className={`${styles.metric} ${styles[tone]}`}><span className={styles.metricIcon}><i className={`bi ${icon}`} aria-hidden="true" /></span><p>{title}</p><div className={styles.metricValues}>{values.map((value) => <strong key={value.id}>{value.currency?.symbol} {format(value.amount)}</strong>)}</div></article>;
const PanelTitle = ({ eyebrow, title, currencies, value, onChange }) => <header className={styles.panelTitle}><div><p>{eyebrow}</p><h2>{title}</h2></div>{currencies?.length > 1 && <select value={value} onChange={(event) => onChange(event.target.value)}>{currencies.map(([id, item]) => <option key={id} value={id}>{item.currency?.symbol} {item.currency?.name}</option>)}</select>}</header>;
const Breakdown = ({ color, label, amount, total, currency, format }) => <div><i style={{ background: color }} /><strong>{label}</strong><span>{currency.symbol} {format(amount)} ({total ? ((amount / total) * 100).toFixed(0) : 0}%)</span></div>;
const Overview = ({ currency, total, paid, pending, format, paidLabel, pendingLabel, totalLabel }) => <><div className={styles.doughnut}><Doughnut data={{ labels: [paidLabel, pendingLabel], datasets: [{ data: [paid, pending], backgroundColor: ['#4fd6be', '#8c63f5'], borderWidth: 0, hoverOffset: 4 }] }} options={{ cutout: '72%', plugins: { legend: { display: false } } }} /><div><span>{currency.symbol}</span><strong>{format(total)}</strong><small>{totalLabel}</small></div></div><div className={styles.breakdown}><Breakdown color="#4fd6be" label={paidLabel} amount={paid} total={total} currency={currency} format={format} /><Breakdown color="#8c63f5" label={pendingLabel} amount={pending} total={total} currency={currency} format={format} /></div></>;

export default Expenses;
