import React, { useState } from 'react';
import styles from './Dashboard.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import { Chart as ChartJS, ArcElement, CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip } from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import ExpensesGrid from "@/Components/Expenses/View/ExpenseGrid";
import Link from 'next/link';
import PageBackButton from '@/Components/Layout/PageBackButton';

ChartJS.register(ArcElement, CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip);

const Dashboard = ({ data, onAddExpensePayment, monthOffset, onPeriodChange }) => {
    const { t } = useTranslation();
    const currencies = Object.entries(data.totalAmountByCurrency || {});
    const [selectedCurrencyId, setSelectedCurrencyId] = useState(currencies[0]?.[0] || '');

    const activeCurrencyId = currencies.some(([currencyId]) => currencyId === selectedCurrencyId) ? selectedCurrencyId : currencies[0]?.[0] || '';

    const formatAmount = (amount) => new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

    const currencyRows = (source) => currencies.map(([currencyId, currencyData]) => ({
        id: currencyId,
        symbol: currencyData.currency?.symbol || '',
        amount: source[currencyId] || 0,
    }));

    const selectedCurrency = data.totalAmountByCurrency?.[activeCurrencyId]?.currency;
    const paid = data.amountPaidByCurrency?.[activeCurrencyId] || 0;
    const pending = data.amountPendingByCurrency?.[activeCurrencyId] || 0;
    const total = data.totalAmountByCurrency?.[activeCurrencyId]?.amount || 0;
    const trend = data.monthlyTrend?.[activeCurrencyId] || [];
    const chartData = {
        labels: [t('Paid'), t('Pending')],
        datasets: [{
            data: [paid, pending],
            backgroundColor: ['#4fd6be', '#f29b4b'],
            borderWidth: 0,
            hoverOffset: 4,
        }],
    };
    const lineData = {
        labels: trend.map((item) => item.label),
        datasets: [
            {
                label: t('Paid'),
                data: trend.map((item) => item.paid),
                borderColor: '#4fd6be',
                backgroundColor: 'rgba(79, 214, 190, 0.15)',
                pointBackgroundColor: '#4fd6be',
                fill: true,
                tension: 0.38,
            },
        ],
    };
    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#a7b5bb', usePointStyle: true, boxWidth: 8 } },
            tooltip: { callbacks: { label: (context) => `${selectedCurrency?.symbol || ''} ${formatAmount(context.raw)}` } },
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#839299' }, border: { display: false } },
            y: { grid: { color: 'rgba(151, 177, 180, 0.1)' }, ticks: { color: '#839299', callback: (value) => formatAmount(value) }, border: { display: false } },
        },
    };

    const formatPaymentDate = (dateString) => {
        const date = new Date(dateString);
        const dateStr = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            timeZone: 'UTC',
        });
        const timeStr = date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
        });
        return `${dateStr} ${timeStr}`;
    };

    const showWizardCta = (!data || !data.expenses || data.expenses.length === 0) && (!data || !data.payments || data.payments.length === 0);

    return (
        <div className={styles.dashboard}>
            <header className={styles.dashboardHeader}>
                <div>
                    <p className={styles.eyebrow}>{t('Financial overview')}</p>
                    <div className={styles.titleRow}><PageBackButton /><h1>{t('Dashboard')}</h1></div>
                    <p className={styles.subtitle}>{t('Your spending, payments, and goals at a glance.')}</p>
                </div>
                <label className={styles.periodControl}>
                    <i className="bi bi-calendar3" aria-hidden="true" />
                    <span className="visually-hidden">{t('Dashboard period')}</span>
                    <select value={monthOffset} onChange={(event) => onPeriodChange(Number(event.target.value))}>
                        <option value="0">{data.monthText}</option>
                        <option value="1">{t('Previous month')}</option>
                        <option value="2">{t('Two months ago')}</option>
                    </select>
                </label>
            </header>
            {showWizardCta && (
                <div className={styles.emptySetupContainer}>
                    <div className={styles.wizardCtaWrapper}>
                        <Link href="/wizard-setup" className={styles.wizardCtaButton}>
                            {t('Start your setup')}
                        </Link>
                    </div>
                </div>
            )}
            {!showWizardCta && <div className={styles.container}>
                <section className={styles.metricGrid} aria-label={t('Financial summary')}>
                    <MetricCard icon="bi-check2-circle" tone="paid" title={t('Total Paid')} rows={currencyRows(data.amountPaidByCurrency || {})} formatAmount={formatAmount} />
                    <MetricCard icon="bi-clock-history" tone="pending" title={t('Total Pending')} rows={currencyRows(data.amountPendingByCurrency || {})} formatAmount={formatAmount} />
                    <MetricCard icon="bi-receipt" tone="expense" title={t('Total Expenses')} rows={currencyRows(Object.fromEntries(currencies.map(([id, value]) => [id, value.amount])))} formatAmount={formatAmount} />
                    <div className={`${styles.metricCard} ${styles.savingsMetric}`}>
                        <div className={styles.metricIcon}><i className="bi bi-piggy-bank" aria-hidden="true" /></div>
                        <p>{t('Saving Goals')}</p>
                        <strong>{data.savingsCount || 0}</strong>
                        <Link href="/savings">{t('View savings')} <i className="bi bi-arrow-up-right" aria-hidden="true" /></Link>
                    </div>
                </section>

                <section className={styles.visualGrid}>
                    <div className={`${styles.panel} ${styles.overviewPanel}`}>
                        <div className={styles.panelHeader}>
                            <div><p className={styles.panelKicker}>{t('Payments Overview')}</p><h2>{t('This month')}</h2></div>
                            <CurrencySelect currencies={currencies} value={activeCurrencyId} onChange={setSelectedCurrencyId} />
                        </div>
                        <div className={styles.doughnutContent}>
                            <div className={styles.doughnutWrap}>
                                <Doughnut data={chartData} options={{ cutout: '72%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${selectedCurrency?.symbol || ''} ${formatAmount(context.raw)}` } } } }} />
                                <div className={styles.doughnutCenter}><span>{selectedCurrency?.symbol}</span><strong>{formatAmount(paid)}</strong><small>{t('Paid')}</small></div>
                            </div>
                            <div className={styles.legend}>
                                <LegendRow tone="paid" label={t('Paid')} value={paid} total={total} symbol={selectedCurrency?.symbol} formatAmount={formatAmount} />
                                <LegendRow tone="pending" label={t('Pending')} value={pending} total={total} symbol={selectedCurrency?.symbol} formatAmount={formatAmount} />
                            </div>
                        </div>
                    </div>
                    <div className={`${styles.panel} ${styles.trendPanel}`}>
                        <div className={styles.panelHeader}>
                            <div><p className={styles.panelKicker}>{t('Monthly Payments')}</p><h2>{t('Paid over time')}</h2></div>
                            <CurrencySelect currencies={currencies} value={activeCurrencyId} onChange={setSelectedCurrencyId} />
                        </div>
                        <div className={styles.lineChart}><Line data={lineData} options={lineOptions} /></div>
                    </div>
                </section>

                <section className={styles.expensesSection}>
                    <ExpensesGrid
                        expenses={data.expenses}
                        expensesNextMonth={data.expensesNextMonth}
                        monthText={data.monthText}
                        nextMonthText={data.nextMonthText}
                        onAddExpensePayment={onAddExpensePayment}
                        showNextMonth={data.dashboardShowNextMonth !== false}
                    />
                </section>
                <section className={styles.activityPanel}>
                    <div className={styles.panelHeader}>
                        <div><p className={styles.panelKicker}>{t('Recent Activity')}</p><h2>{t('Summary Payments')}</h2></div>
                        <Link href="/payments" className={styles.viewAll}>{t('View All')}</Link>
                    </div>
                        {data && data.payments && data.payments.length > 0 && (
                            <div className={styles.tableContainer}>
                                <div className={styles.dashboardTable}>
                                    <div className={styles.dashboardTableHeader}>
                                        <div className={styles.dashboardTableHeaderCell}>{t('Expense')}</div>
                                        <div className={styles.dashboardTableHeaderCell}>{t('Amount')}</div>
                                        <div className={styles.dashboardTableHeaderCell}>{t('Date')}</div>
                                    </div>
                                    {data.payments.map((payment) => (
                                        <div key={payment.id} className={styles.dashboardTableRow}>
                                            <div className={styles.dashboardTableCell}>{payment.expense_name}</div>
                                            <div
                                                className={styles.dashboardTableCell}>{payment.currency_symbol} {payment.amount}</div>
                                            <div className={styles.dashboardTableCell}>
                                                {formatPaymentDate(payment.created_at)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.dashboardMobileTable}>
                                    {data.payments.map((payment) => (
                                        <div key={payment.id} className={styles.dashboardTableRow}>
                                            <div className={styles.dashboardTableCell}>{payment.expense_name}</div>
                                            <div
                                                className={styles.dashboardTableCell}>{payment.currency_symbol} {payment.amount}</div>
                                            <div className={styles.dashboardTableCell}>
                                                {formatPaymentDate(payment.created_at)}
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        )}
                        {data && data.payments && data.payments.length === 0 && (
                            <div className={styles.emptyContainer}>
                                <div className={styles.emptyMessage}>{t('No payments found')}</div>
                            </div>
                        )}
                </section>
            </div>}
        </div>
    );
};

const MetricCard = ({ icon, title, rows, tone, formatAmount }) => (
    <div className={`${styles.metricCard} ${styles[tone]}`}>
        <div className={styles.metricIcon}><i className={`bi ${icon}`} aria-hidden="true" /></div>
        <p>{title}</p>
        <div className={styles.currencyValues}>
            {rows.map((row) => <strong key={row.id}><span>{row.symbol}</span> {formatAmount(row.amount)}</strong>)}
        </div>
    </div>
);

const CurrencySelect = ({ currencies, value, onChange }) => currencies.length > 1 && (
    <label className={styles.currencySelect}>
        <span className="visually-hidden">Currency</span>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
            {currencies.map(([id, value]) => <option key={id} value={id}>{value.currency?.symbol} {value.currency?.name}</option>)}
        </select>
    </label>
);

const LegendRow = ({ tone, label, value, total, symbol, formatAmount }) => (
    <div className={styles.legendRow}>
        <span className={`${styles.legendDot} ${styles[tone]}`} />
        <div><strong>{label}</strong><span>{symbol} {formatAmount(value)} ({total ? Math.round((value / total) * 100) : 0}%)</span></div>
    </div>
);

export default Dashboard;
