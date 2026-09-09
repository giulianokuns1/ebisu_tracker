import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '@/Hooks/useTranslation';
import styles from './MobileBottomNavigation.module.scss';

const moreItems = [['Pending Expenses', '/pendingExpenses', 'bi-clock-history'], ['Savings', '/savings', 'bi-piggy-bank'], ['Annual Plan', '/annual-plan', 'bi-calendar2-week'], ['Reports', '/reports', 'bi-bar-chart-line'], ['Categories', '/categories', 'bi-tags'], ['Payment Methods', '/paymentMethods', 'bi-credit-card'], ['Settings', '/settings', 'bi-gear']];
const matchesRoute = (pathname, routes) => routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export default function MobileBottomNavigation({ onQuickActions }) {
    const { t } = useTranslation();
    const router = useRouter();
    const [moreOpen, setMoreOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);
    const closeMore = () => setMoreOpen(false);
    const navItem = (label, href, icon, active) => <Link href={href} className={`${styles.item} ${active ? styles.active : ''}`} onClick={closeMore}><i className={`bi ${icon}`} aria-hidden="true" /><span>{t(label)}</span></Link>;
    const isMoreActive = matchesRoute(router.pathname, moreItems.map(([, href]) => href));

    return <>
        {moreOpen && <button type="button" className={styles.backdrop} onClick={closeMore} aria-label={t('Close menu')} />}
        <nav className={styles.navigation} aria-label={t('Mobile navigation')}>
            {navItem('Dashboard', '/dashboard', 'bi-house-fill', matchesRoute(router.pathname, ['/dashboard']))}
            {navItem('Expenses', '/expenses', 'bi-calendar3', matchesRoute(router.pathname, ['/expenses']))}
            <button type="button" className={styles.quickAction} onClick={onQuickActions} aria-label={t('Quick actions')}><span><i className="bi bi-plus-lg" aria-hidden="true" /></span></button>
            {navItem('Payments', '/payments', 'bi-credit-card', matchesRoute(router.pathname, ['/payments']))}
            <button type="button" className={`${styles.item} ${isMoreActive || moreOpen ? styles.active : ''}`} onClick={() => setMoreOpen((value) => !value)} aria-expanded={moreOpen}><i className="bi bi-grid-3x3-gap-fill" aria-hidden="true" /><span>{t('More')}</span></button>
        </nav>
        {moreOpen && <section className={styles.sheet} aria-label={t('More navigation')}><header><h2>{t('More')}</h2><button type="button" onClick={closeMore} aria-label={t('Close menu')}><i className="bi bi-x-lg" aria-hidden="true" /></button></header><div>{moreItems.map(([label, href, icon]) => <Link key={href} href={href} onClick={closeMore} className={matchesRoute(router.pathname, [href]) ? styles.sheetActive : ''}><i className={`bi ${icon}`} aria-hidden="true" /><span>{t(label)}</span><i className="bi bi-chevron-right" aria-hidden="true" /></Link>)}</div><Link href="/myaccount" onClick={closeMore} className={`${styles.profileLink} ${matchesRoute(router.pathname, ['/myaccount']) ? styles.sheetActive : ''}`}><span className={styles.profileAvatar}>{user?.firstname?.[0] || 'E'}{user?.lastname?.[0] || ''}</span><span><strong>{user ? `${user.firstname} ${user.lastname}` : t('My Account')}</strong><small>{t('My account')}</small></span><i className="bi bi-chevron-right" aria-hidden="true" /></Link></section>}
    </>;
}
