import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { Chart as ChartJS, BarElement, CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { API_BASE_URL } from '@/constants';
import styles from './SavingsDashboard.module.scss';
import tableStyles from '@/Components/Expenses/ExpensesWorkspace.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';

ChartJS.register(BarElement, CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip);
const colors = ['#4fd6be', '#8c63f5', '#f29b4b', '#f4cf43', '#48b7de'];
const formatDateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const formatChartDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const transactionPageSizeOptions = [10, 25, 50];

export default function SavingsDashboard({ data, onRefresh, range }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [chartMode, setChartMode] = useState('balance');
    const [chartCurrencyId, setChartCurrencyId] = useState('');
    const [transactionPageSize, setTransactionPageSize] = useState(10);
    const [transactionPage, setTransactionPage] = useState(1);
    const emptyForm = () => ({ savingId: '', currencyId: data.currencies?.[0]?.id || '', amount: '', comment: '', transactionDate: new Date().toISOString().slice(0, 10) });
    const [form, setForm] = useState(emptyForm);
    const format = (value) => new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);
    const totals = Object.values(data.totals || {});
    const goals = data.goals || [];
    const transactions = data.transactions || [];
    const transactionPageCount = Math.max(1, Math.ceil(transactions.length / transactionPageSize));
    const activeTransactionPage = Math.min(transactionPage, transactionPageCount);
    const firstTransaction = (activeTransactionPage - 1) * transactionPageSize;
    const visibleTransactions = transactions.slice(firstTransaction, firstTransaction + transactionPageSize);
    const chartTransactions = data.chartTransactions || [];
    const chartCurrencies = (data.currencies || []).filter((currency) => chartTransactions.some((transaction) => String(transaction.currency_id) === String(currency.id)));
    const selectedCurrencyId = chartCurrencyId || chartCurrencies[0]?.id || '';
    const selectedCurrency = chartCurrencies.find((currency) => String(currency.id) === String(selectedCurrencyId));
    const chartStart = formatDateKey(range[0]);
    const chartEnd = formatDateKey(range[1]);
    const currencyTransactions = chartTransactions.filter((transaction) => String(transaction.currency_id) === String(selectedCurrencyId));
    const openingBalance = currencyTransactions.filter((transaction) => String(transaction.transaction_date).slice(0, 10) < chartStart).reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const dailyActivity = currencyTransactions.reduce((days, transaction) => {
        const date = String(transaction.transaction_date).slice(0, 10);
        if (date >= chartStart && date <= chartEnd) days[date] = (days[date] || 0) + Number(transaction.amount);
        return days;
    }, {});
    const activityDates = Object.keys(dailyActivity).sort();
    let runningBalance = openingBalance;
    const balancePoints = activityDates.map((date) => ({ date, value: runningBalance += dailyActivity[date] }));
    if (!balancePoints.length || balancePoints[0].date !== chartStart) balancePoints.unshift({ date: chartStart, value: openingBalance });
    const chartPoints = chartMode === 'balance' ? balancePoints : activityDates.map((date) => ({ date, value: dailyActivity[date] }));
    const chartData = { labels: chartPoints.map((point) => formatChartDate(point.date)), datasets: [{ label: chartMode === 'balance' ? 'Closing balance' : 'Net savings activity', data: chartPoints.map((point) => point.value), borderColor: '#4fd6be', backgroundColor: chartMode === 'balance' ? 'rgba(79,214,190,.12)' : chartPoints.map((point) => point.value >= 0 ? 'rgba(79,214,190,.78)' : 'rgba(242,155,75,.82)'), borderRadius: chartMode === 'activity' ? 4 : undefined, fill: chartMode === 'balance', tension: .35 }] };
    const chartOptions = { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { color: 'rgba(146,182,180,.06)' }, ticks: { color: '#8ea2a1' } }, y: { grid: { color: 'rgba(146,182,180,.08)' }, ticks: { color: '#8ea2a1' } } }, plugins: { legend: { labels: { color: '#b7c8c6' } }, tooltip: { callbacks: { label: (context) => `${selectedCurrency?.symbol || ''} ${format(context.raw)}` } } } };
    const openNew = () => { setEditingId(null); setForm(emptyForm()); setOpen(true); };
    const openEdit = (transaction) => { setEditingId(transaction.id); setForm({ savingId: transaction.saving_id || '', currencyId: transaction.currency_id || '', amount: transaction.amount, comment: transaction.comment || '', transactionDate: String(transaction.transaction_date).slice(0, 10) }); setOpen(true); };
    const save = async () => { const token = localStorage.getItem('token'); await axios.post(`${API_BASE_URL}/${editingId ? 'updateSavingTransaction' : 'newSavingTransaction'}`, { ...form, id: editingId || undefined }, { headers: { Authorization: `Bearer ${token}` } }); setOpen(false); if (onRefresh) onRefresh(); };
    const remove = async () => { const token = localStorage.getItem('token'); await axios.post(`${API_BASE_URL}/deleteSavingTransaction`, { id: editingId }, { headers: { Authorization: `Bearer ${token}` } }); setConfirmOpen(false); setOpen(false); if (onRefresh) onRefresh(); };
    const updateTransactionPageSize = (event) => { setTransactionPageSize(Number(event.target.value)); setTransactionPage(1); };
    return <div className={styles.dashboard}>
        <section className={styles.metrics}><Metric title="Total Savings Balance" values={totals.map((item) => `${item.symbol || ''} ${format(item.balance)}`)} tone="teal" icon="bi-wallet2" /><Metric title="Monthly Saved" values={totals.map((item) => `${item.symbol || ''} ${format(item.monthly)}`)} tone="blue" icon="bi-cash-stack" /><Metric title="Savings Goals" values={[`${goals.length} active`]} tone="violet" icon="bi-piggy-bank" /><Metric title="Avg. Goal Progress" values={[`${goals.length ? (goals.reduce((sum, goal) => sum + goal.percentage, 0) / goals.length).toFixed(0) : 0}%`]} tone="orange" icon="bi-bar-chart-line" /></section>
        <section className={styles.grid}><article className={styles.panel}><div className={styles.chartHeader}><h2>{chartMode === 'balance' ? 'Savings Balance Overview' : 'Net Savings Activity'}</h2><div className={styles.chartControls}><div className={styles.chartMode} aria-label="Chart type"><button type="button" className={chartMode === 'balance' ? styles.activeChartMode : ''} onClick={() => setChartMode('balance')}>Balance</button><button type="button" className={chartMode === 'activity' ? styles.activeChartMode : ''} onClick={() => setChartMode('activity')}>Activity</button></div>{chartCurrencies.length > 1 && <select value={selectedCurrencyId} onChange={(event) => setChartCurrencyId(event.target.value)} aria-label="Chart currency">{chartCurrencies.map((currency) => <option key={currency.id} value={currency.id}>{currency.name} ({currency.symbol})</option>)}</select>}</div></div><div className={styles.chart}>{chartMode === 'balance' ? <Line data={chartData} options={chartOptions} /> : <Bar data={chartData} options={chartOptions} />}</div></article><article className={styles.panel}><h2>Savings Goals</h2><div className={styles.goals}>{goals.map((goal, index) => <Link href={`/savings/details/${goal.id}`} className={styles.goal} key={goal.id}><div><strong>{goal.name}</strong><span>{goal.currency_symbol} {format(goal.balance)} / {goal.currency_symbol} {format(goal.target_amount)}</span><div className={styles.progress}><i style={{ width: `${goal.percentage}%`, background: colors[index % colors.length] }} /></div></div><b>{goal.percentage.toFixed(0)}%</b></Link>)}</div><Link href="/savings/create" className={styles.addGoal}><i className="bi bi-plus-lg" /> Add New Goal</Link></article></section>
        <section className={`${tableStyles.listPanel} ${styles.transactionsPanel}`}><header className={styles.transactionsHeader}><div><h2>{t('Savings')}</h2><p>{transactions.length ? `${t('Showing')} ${firstTransaction + 1}-${Math.min(firstTransaction + transactionPageSize, transactions.length)} ${t('of')} ${transactions.length} ${t('entries')}` : t('No savings activity in this period.')}</p></div><div className={styles.transactionActions}><label className={styles.transactionPageSize}>{t('Rows per page')}<select value={transactionPageSize} onChange={updateTransactionPageSize}>{transactionPageSizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><button className={styles.addSaving} type="button" onClick={openNew}><i className="bi bi-plus-lg" /> {t('Add Saving')}</button></div></header>{transactions.length ? <><div className={tableStyles.table} role="table" aria-label={t('Savings')}><div className={`${tableStyles.tableRow} ${tableStyles.tableHead}`} role="row"><span>{t('Date')}</span><span>{t('Description')}</span><span>{t('Goal')}</span><span>{t('Amount')}</span><span>{t('Type')}</span><span>{t('Actions')}</span></div>{visibleTransactions.map((item) => { const isWithdrawal = Number(item.amount) < 0; return <button key={item.id} type="button" className={tableStyles.tableRow} onClick={() => openEdit(item)}><span>{new Date(item.transaction_date).toLocaleDateString()}</span><span className={`${tableStyles.description} ${styles.transactionDescription}`}><i className={`bi ${isWithdrawal ? 'bi-arrow-up-right-circle' : 'bi-piggy-bank'}`} aria-hidden="true" /><span>{item.comment || t('Saved money')}</span></span><span className={tableStyles.categoryChip}>{item.saving_name || t('Unassigned Savings')}</span><span className={isWithdrawal ? tableStyles.pendingAmount : tableStyles.paidAmount}>{item.currency_symbol} {format(item.amount)}</span><span className={isWithdrawal ? tableStyles.pendingStatus : tableStyles.paidStatus}>{isWithdrawal ? t('Withdrawal') : t('Saving')}</span><span className={tableStyles.edit}><i className="bi bi-pencil" aria-hidden="true" /><span className="visually-hidden">{t('Edit')}</span></span></button>; })}</div>{transactionPageCount > 1 && <nav className={styles.transactionsPagination} aria-label={t('Savings pages')}><button type="button" onClick={() => setTransactionPage(activeTransactionPage - 1)} disabled={activeTransactionPage === 1}><i className="bi bi-chevron-left" aria-hidden="true" /> {t('Previous')}</button><span>{t('Page')} {activeTransactionPage} {t('of')} {transactionPageCount}</span><button type="button" onClick={() => setTransactionPage(activeTransactionPage + 1)} disabled={activeTransactionPage === transactionPageCount}>{t('Next')} <i className="bi bi-chevron-right" aria-hidden="true" /></button></nav>}</> : <div className={styles.transactionsEmpty}><i className="bi bi-piggy-bank" aria-hidden="true" /><p>{t('No savings activity in this period.')}</p></div>}</section>
        <Dialog visible={open} onHide={() => setOpen(false)} header={editingId ? 'Edit Saving' : 'Add Saving'} className={styles.dialog}><div className={styles.transactionForm}><label>Goal<select value={form.savingId} onChange={(event) => setForm({ ...form, savingId: event.target.value })}><option value="">Unassigned Savings</option>{goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.name}</option>)}</select></label><label>Currency<select value={form.currencyId} onChange={(event) => setForm({ ...form, currencyId: event.target.value })}>{data.currencies?.map((currency) => <option key={currency.id} value={currency.id}>{currency.name} {currency.symbol}</option>)}</select></label><label>Amount<input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label><label>Date<input type="date" value={form.transactionDate} onChange={(event) => setForm({ ...form, transactionDate: event.target.value })} /></label><label className={styles.full}>Comment<input value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} /></label>{editingId && <button className={styles.removeSaving} type="button" onClick={() => setConfirmOpen(true)}>Remove Saving</button>}<button className={styles.saveSaving} type="button" onClick={save}>{editingId ? 'Update Saving' : 'Save Saving'}</button></div></Dialog>
        <Dialog visible={confirmOpen} onHide={() => setConfirmOpen(false)} header="Remove saving" className={styles.dialog}><div className={styles.removeConfirmation}><p>This action permanently removes this saving entry.</p><div className={styles.confirmActions}><button type="button" onClick={() => setConfirmOpen(false)}>Cancel</button><button className={styles.removeSaving} type="button" onClick={remove}>Remove Saving</button></div></div></Dialog>
    </div>;
}

const Metric = ({ title, values, tone, icon }) => <article className={`${styles.metric} ${styles[tone]}`}><i className={`bi ${icon}`} aria-hidden="true" /><p>{title}</p>{values.map((value, index) => <strong key={`${value}-${index}`}>{value}</strong>)}</article>;
