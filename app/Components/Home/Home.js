import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Home.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';

const features = [
    ['bi-receipt', 'Track Everything', 'Add, organize, and understand every expense in one clear workspace.'],
    ['bi-bar-chart-line', 'Insightful Reports', 'Turn everyday transactions into useful spending patterns.'],
    ['bi-piggy-bank', 'Reach Your Goals', 'Set savings goals and follow your progress with confidence.'],
    ['bi-shield-lock', 'Secure & Private', 'Your financial information stays private and protected.'],
];

const previewExpenses = [['bi-cart3', 'Groceries', 'UYU 30,000.00'], ['bi-house', 'Rent', 'UYU 45,650.00'], ['bi-lightning-charge', 'Utilities', 'UYU 12,300.00']];
const faqItems = [
    ['What is Ebisu Tracker?', 'Ebisu Tracker is a personal finance and expense tracker that helps you organize spending, payments, savings goals, budgets, and cash flow in one dashboard.'],
    ['How does expense tracking work?', 'Add expenses, categories, due dates, and payment details. Ebisu Tracker keeps your spending and upcoming payments visible so you can make informed decisions.'],
    ['Can I track recurring expenses and upcoming payments?', 'Yes. You can manage recurring expenses, track payment progress, and review pending expenses before their due dates.'],
    ['Can I manage multiple currencies?', 'Yes. Ebisu Tracker supports multiple currencies so you can organize expenses and payments in the currencies you use.'],
    ['Can I set savings goals?', 'Yes. Create savings goals, record progress, and keep your financial targets visible alongside your day-to-day spending.'],
    ['Is Ebisu Tracker free to use?', 'Ebisu Tracker offers a free plan so you can begin tracking expenses and managing your personal finances without a credit card.'],
];

export default function Home() {
    const { t } = useTranslation();
    return <div className={styles.wrapper}>
        <section className={styles.hero}>
            <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>{t('Expense tracking made simple')}</span>
                <h1>{t('Master your money')}<br />{t('with')} <em>{t('precision.')}</em></h1>
                <p>{t("Track expenses, visualize cash flow, and achieve financial clarity with the most elegant dashboard you've ever used.")}</p>
                <div className={styles.heroActions}><Link href="/register" className={styles.primaryAction}>{t('Get Started Free')} <i className="bi bi-arrow-right" aria-hidden="true" /></Link></div>
                <div className={styles.reassurance}><span><i className="bi bi-credit-card" aria-hidden="true" />{t('No credit card required')}</span><span><i className="bi bi-gift" aria-hidden="true" />{t('Free forever plan available')}</span><span><i className="bi bi-sliders" aria-hidden="true" />{t('Simple, focused tools')}</span></div>
            </div>
            <HomeDashboardPreview />
        </section>
        <section id="features" className={styles.features}>
            <div className={styles.sectionIntro}><span>{t('Built for clarity')}</span><h2>{t('Everything you need to take control')}</h2></div>
            <div className={styles.featureGrid}>{features.map(([icon, title, description]) => <article className={styles.featureCard} key={title}><i className={`bi ${icon}`} aria-hidden="true" /><div><h3>{t(title)}</h3><p>{t(description)}</p></div></article>)}</div>
        </section>
        <section id="how-it-works" className={styles.workflow}>
            <div><span>{t('How it works')}</span><h2>{t('A calmer way to manage money')}</h2></div>
            <ol><li><b>01</b><div><strong>{t('Set your currencies')}</strong><p>{t('Start with the money you actually use.')}</p></div></li><li><b>02</b><div><strong>{t('Add recurring expenses')}</strong><p>{t('Keep upcoming payments visible before they surprise you.')}</p></div></li><li><b>03</b><div><strong>{t('Make better decisions')}</strong><p>{t('Use clear progress and reports to move toward your goals.')}</p></div></li></ol>
        </section>
        <section className={styles.faq} aria-labelledby="faq-title">
            <div className={styles.sectionIntro}><span>{t('Questions answered')}</span><h2 id="faq-title">{t('Personal finance tracker FAQ')}</h2><p>{t('Learn how Ebisu Tracker helps you manage expenses, payments, budgets, and savings goals.')}</p></div>
            <div className={styles.faqGrid}>{faqItems.map(([question, answer]) => <article key={question}><h3>{t(question)}</h3><p>{t(answer)}</p></article>)}</div>
        </section>
    </div>;
}

const DashboardPreview = () => <div className={styles.previewWrap} aria-label="Ebisu dashboard preview">
    <div className={styles.previewSidebar}><div className={styles.previewBrand}><span>e</span><b>Ebisu<br /><small>Tracker</small></b></div>{['Dashboard', 'Payments', 'Expenses', 'Savings', 'Reports'].map((item, index) => <div className={index === 0 ? styles.activePreviewNav : styles.previewNav} key={item}><i className={`bi ${['bi-grid-1x2', 'bi-cash-coin', 'bi-receipt', 'bi-piggy-bank', 'bi-bar-chart'][index]}`} aria-hidden="true" />{item}</div>)}</div>
    <div className={styles.previewContent}><header><div><h2>Dashboard</h2><p>Good morning, Giuliano</p></div><button type="button"><i className="bi bi-plus-lg" aria-hidden="true" /> Add New</button></header><div className={styles.metricRow}>{[['Total Expenses', 'UYU 182,300.00'], ['Total Paid', 'UYU 91,150.00'], ['Total Pending', 'UYU 91,150.00']].map(([label, value], index) => <div className={styles.previewMetric} key={label}><span>{label}</span><strong className={index === 2 ? styles.orange : ''}>{value}</strong><small>↑ 12.4% vs Jul</small></div>)}</div><div className={styles.previewMain}><article className={styles.donutPanel}><h3>Expenses Overview</h3><div className={styles.donut}><b>UYU<br /><strong>182,300</strong></b></div><ul><li><i />Rent <span>25%</span></li><li><i />Groceries <span>22%</span></li><li><i />Utilities <span>15%</span></li></ul></article><article className={styles.chartPanel}><h3>Cash Flow</h3><div className={styles.chartBars}>{[42, 61, 52, 76, 68, 91, 72].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div><div className={styles.months}><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span></div></article></div><article className={styles.recentPanel}><h3>Recent Expenses <small>View all</small></h3>{previewExpenses.map(([icon, name, value]) => <div key={name}><i className={`bi ${icon}`} aria-hidden="true" /><span>{name}<small>Aug 2024</small></span><b>{value}</b></div>)}</article></div>
</div>;

const previewNavigation = [
    ['bi-speedometer', 'Dashboard'], ['bi-cash-coin', 'Payments'], ['bi-clock-history', 'Pending Expenses'], ['bi-cash', 'Expenses'], ['bi-piggy-bank', 'Savings'], ['bi-grid', 'Categories'], ['bi-currency-exchange', 'Currencies'], ['bi-credit-card-2-back', 'Payment Methods'], ['bi-bar-chart-line', 'Reports'], ['bi-gear', 'Settings'],
];
const previewUpcoming = [['bi-cart3', 'Groceries', 'USD 486.20', 'Pending'], ['bi-house', 'Rent', 'USD 1,450.00', 'Paid'], ['bi-lightning-charge', 'Utilities', 'USD 178.65', 'Pending']];

const HomeDashboardPreview = () => <div className={styles.homeDashboard} aria-label="Ebisu dashboard preview">
    <aside className={styles.homePreviewSidebar}>
        <div className={styles.homePreviewBrand}><Image src="/img/logo3.0-removebg-preview.png" alt="Ebisu" width={36} height={36} /><span><b>Ebisu</b><small>Expense Tracker</small></span></div>
        <nav>{previewNavigation.map(([icon, label], index) => <div key={label} className={index === 0 ? styles.homePreviewActive : styles.homePreviewNav}><i className={`bi ${icon}`} aria-hidden="true" /><span>{label}</span>{label === 'Pending Expenses' && <em>4</em>}</div>)}</nav>
    </aside>
    <main className={styles.homePreviewMain}>
        <header><div><span>Financial overview</span><h2>Dashboard</h2><p>Your spending, payments, and goals at a glance.</p></div><button type="button"><i className="bi bi-calendar3" aria-hidden="true" /> August</button></header>
        <div className={styles.homePreviewMetrics}>{[['bi-check2-circle', 'Total Paid', 'USD 8,642.75', '↑ 14.8% vs Jul', 'paid'], ['bi-clock-history', 'Total Pending', 'USD 1,294.85', '↓ 8.2% vs Jul', 'pending'], ['bi-receipt', 'Total Expenses', 'USD 9,937.60', '↑ 5.6% vs Jul', 'expenses'], ['bi-piggy-bank', 'Saving Goals', '3', 'View savings ↗', 'goals']].map(([icon, label, value, detail, tone]) => <article className={`${styles.homePreviewMetric} ${styles[tone]}`} key={label}><i className={`bi ${icon}`} aria-hidden="true" /><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>)}</div>
        <div className={styles.homePreviewAnalytics}><article className={styles.homePreviewDonutPanel}><div className={styles.previewPanelTitle}><span>Payments overview</span><b>This month</b></div><div className={styles.homePreviewDonut}><div>USD<strong>8,642.75</strong><small>Paid</small></div></div><div className={styles.previewDonutLegend}><span><i />Paid <b>USD 8,642.75</b></span><span><i />Pending <b>USD 1,294.85</b></span></div></article><article className={styles.homePreviewChartPanel}><div className={styles.previewPanelTitle}><span>Monthly payments</span><b>Paid over time</b></div><div className={styles.previewLineChart}><span className={styles.previewLineLabel}>Paid</span><svg viewBox="0 0 320 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0,96 L45,75 L90,89 L135,48 L180,66 L225,30 L270,53 L320,14 L320,120 L0,120 Z" /><polyline points="0,96 45,75 90,89 135,48 180,66 225,30 270,53 320,14" /></svg><div><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span></div></div></article></div>
        <div className={styles.homePreviewLists}>{['August', 'September'].map((month, index) => <article key={month}><div className={styles.previewPanelTitle}><b>{month}</b><span>View all</span></div>{previewUpcoming.map(([icon, name, amount, status]) => <div className={styles.homePreviewExpense} key={`${month}-${name}`}><i className={`bi ${icon}`} aria-hidden="true" /><span><strong>{name}</strong><small>{index ? '10/09' : '10/08'}</small></span><b>{amount}</b><em className={status === 'Paid' ? styles.previewPaid : styles.previewPending}>{status}</em></div>)}</article>)}</div>
    </main>
</div>;
