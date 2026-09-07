import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip } from 'chart.js';
import LayoutApp from '@/Components/Layout/LayoutApp';
import PageBackButton from '@/Components/Layout/PageBackButton';
import Loading from '@/Components/UI/Loading';
import { API_BASE_URL, WEBSITE_NAME } from '@/constants';
import { withAuth } from '@/Hoc/withAuth';
import { useTranslation } from '@/Hooks/useTranslation';
import styles from '@/Components/Reports/Reports.module.scss';

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Tooltip);

const chartColors = ['#4fd6be', '#a78bfa', '#f29b4b', '#5ac6ee', '#ef6b7a', '#809297'];

function ReportsPage() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();
    const [data, setData] = useState(null);
    const [year, setYear] = useState(currentYear);
    const [view, setView] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        let active = true;
        const load = async () => {
            setError(false);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/reports`, { params: { year }, headers: { Authorization: `Bearer ${token}` } });
                if (!active) return;
                setData(response.data);
                setView((current) => current || String(response.data.currencies[0]?.id || ''));
            } catch (requestError) {
                if (!active) return;
                setError(true);
                setData(null);
            }
        };
        load();
        return () => { active = false; };
    }, [year]);

    if (!data && !error) return <LayoutApp><Loading /></LayoutApp>;
    const reports = data?.reportsByCurrency || {};
    const activeReport = reports[view];

    return <LayoutApp>
        <Head><title>{`Reports | ${WEBSITE_NAME}`}</title></Head>
        <main className={styles.reports}>
            <header className={styles.header}>
                <div><p className={styles.eyebrow}>{t('Spending intelligence')}</p><div className={styles.titleRow}><PageBackButton /><h1>{t('Reports')}</h1></div><p className={styles.subtitle}>{t('Understand where your paid expenses go and how they change over time.')}</p></div>
                <label className={styles.yearFilter}><span>{t('Year')}</span><select value={year} onChange={(event) => setYear(Number(event.target.value))}>{Array.from({ length: 5 }, (_, index) => currentYear - index).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            </header>
            {error ? <section className={styles.errorState}><i className="bi bi-exclamation-triangle" aria-hidden="true" /><strong>{t('Reports unavailable')}</strong><span>{t('We could not load your spending data right now.')}</span></section> : <>
                <nav className={styles.currencyTabs} aria-label={t('Report currency')}>{data.currencies.map((currency) => <button type="button" key={currency.id} onClick={() => setView(String(currency.id))} className={String(view) === String(currency.id) ? styles.activeTab : ''}>{currency.symbol} {currency.name}</button>)}</nav>
                <CurrencyReport report={activeReport} t={t} />
            </>}
        </main>
    </LayoutApp>;
}

const format = (amount) => new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(amount) || 0);
const options = (symbol) => ({ responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' }, plugins: { legend: { labels: { boxHeight: 8, boxWidth: 8, color: '#a7b5bb', usePointStyle: true } }, tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${symbol} ${format(context.raw)}` } } }, scales: { x: { grid: { display: false }, ticks: { color: '#839299', font: { size: 11 } }, border: { display: false } }, y: { grid: { color: 'rgba(151,177,180,.1)' }, ticks: { color: '#839299', font: { size: 11 }, callback: (value) => format(value) }, border: { display: false } } } });
const PanelTitle = ({ kicker, title }) => <header className={styles.panelTitle}><p>{kicker}</p><h2>{title}</h2></header>;
const Metric = ({ icon, label, value, tone }) => <article className={`${styles.metric} ${styles[tone]}`}><span className={styles.metricIcon}><i className={`bi ${icon}`} aria-hidden="true" /></span><p>{label}</p><strong>{value}</strong></article>;

const CurrencyReport = ({ report, t }) => {
    if (!report) return null;
    const { currency, summary, monthly, categories, categoryBreakdown, largestPayments } = report;
    const symbol = currency.symbol;
    if (!summary.paymentCount) return <section className={styles.emptyState}><i className="bi bi-bar-chart-line" aria-hidden="true" /><strong>{t('No payments recorded')}</strong><span>{t('Record payments in this year and currency to unlock spending insights.')}</span></section>;
    return <>
        <section className={styles.metricGrid} aria-label={t('Spending summary')}><Metric icon="bi-wallet2" label={t('Paid this year')} value={`${symbol} ${format(summary.total)}`} tone="total" /><Metric icon="bi-calendar3" label={t('Active-month average')} value={`${symbol} ${format(summary.average)}`} tone="average" /><Metric icon="bi-graph-up-arrow" label={t('Highest spending month')} value={`${summary.highestMonth.label} · ${symbol} ${format(summary.highestMonth.amount)}`} tone="peak" /><Metric icon="bi-receipt" label={t('Payments recorded')} value={summary.paymentCount} tone="count" /></section>
        <section className={styles.contentGrid}>
            <article className={`${styles.panel} ${styles.trendPanel}`}><PanelTitle kicker={t('Monthly spending')} title={t('Paid expenses across the year')} /><div className={styles.chart}><Line data={{ labels: monthly.map((item) => item.label), datasets: [{ label: t('Paid expenses'), data: monthly.map((item) => item.amount), borderColor: '#4fd6be', backgroundColor: 'rgba(79,214,190,.15)', fill: true, pointBackgroundColor: '#4fd6be', pointBorderColor: '#10282e', pointBorderWidth: 2, pointRadius: 4, tension: .35 }] }} options={options(symbol)} /></div></article>
            <article className={`${styles.panel} ${styles.categoryPanel}`}><PanelTitle kicker={t('Category mix')} title={t('Where paid money went')} /><div className={styles.categoryContent}><div className={styles.doughnut}><Doughnut data={{ labels: categories.map((item) => item.name), datasets: [{ data: categories.map((item) => item.amount), backgroundColor: categories.map((item, index) => item.color || chartColors[index % chartColors.length]), borderColor: '#182a2f', borderWidth: 3, hoverOffset: 5 }] }} options={{ cutout: '68%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${symbol} ${format(context.raw)}` } } } }} /><div><span>{symbol}</span><strong>{format(summary.total)}</strong><small>{t('Paid')}</small></div></div><div className={styles.categoryLegend}>{categories.slice(0, 5).map((item, index) => <div key={item.name}><i style={{ backgroundColor: item.color || chartColors[index % chartColors.length] }} /><span><strong>{item.name}</strong><small>{item.percentage.toFixed(1)}%</small></span><b>{symbol} {format(item.amount)}</b></div>)}</div></div></article>
            <article className={`${styles.panel} ${styles.breakdownPanel}`}><PanelTitle kicker={t('Spending composition')} title={t('Top categories by month')} /><div className={styles.chart}><Bar data={{ labels: monthly.map((item) => item.label), datasets: categoryBreakdown.map((category, index) => ({ label: category.name, data: category.monthly, backgroundColor: category.color || chartColors[index % chartColors.length], borderRadius: 3, borderSkipped: false })) }} options={{ ...options(symbol), scales: { ...options(symbol).scales, x: { ...options(symbol).scales.x, stacked: true }, y: { ...options(symbol).scales.y, stacked: true } } }} /></div></article>
            <article className={`${styles.panel} ${styles.rankingsPanel}`}><PanelTitle kicker={t('Category ranking')} title={t('Largest shares of spending')} /><div className={styles.rankings}>{categories.slice(0, 5).map((item, index) => <div className={styles.rankRow} key={item.name}><span className={styles.rankNumber}>{String(index + 1).padStart(2, '0')}</span><div><header><strong>{item.name}</strong><b>{symbol} {format(item.amount)}</b></header><span className={styles.track}><i style={{ width: `${item.percentage}%`, backgroundColor: item.color || chartColors[index % chartColors.length] }} /></span><small>{item.percentage.toFixed(1)}% {t('of paid expenses')}</small></div></div>)}</div></article>
            <article className={`${styles.panel} ${styles.largestPanel}`}><PanelTitle kicker={t('Largest payments')} title={t('Highest individual transactions')} /><div className={styles.payments}>{largestPayments.map((payment) => <div className={styles.paymentRow} key={payment.id}><span><strong>{payment.name}</strong><small>{payment.category}</small></span><b>{symbol} {format(payment.amount)}</b></div>)}</div></article>
        </section>
    </>;
};

export default withAuth(ReportsPage);
