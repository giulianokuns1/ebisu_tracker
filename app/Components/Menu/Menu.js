import React, { useEffect, useState } from 'react';
import styles from './Menu.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { WEBSITE_NAME } from '@/constants';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';

const menuItems = [
    { href: '/dashboard', icon: 'bi-speedometer', label: 'Dashboard' },
    { href: '/payments', icon: 'bi-cash-coin', label: 'Payments' },
    { href: '/pendingExpenses', icon: 'bi-clock-history', label: 'Pending Expenses' },
    { href: '/expenses', icon: 'bi-cash', label: 'Expenses' },
    { href: '/annual-plan', icon: 'bi-calendar3', label: 'Annual Plan' },
    // { href: '/budgets', icon: 'bi-wallet', label: 'Budget' },
    { href: '/savings', icon: 'bi-piggy-bank', label: 'Savings' },
    // { href: '/bills', icon: 'bi-file-text', label: 'Bills' },
    { href: '/categories', icon: 'bi-grid', label: 'Categories' },
    { href: '/currencies', icon: 'bi-currency-exchange', label: 'Currencies' },
    { href: '/paymentMethods', icon: 'bi-credit-card-2-back', label: 'Payment Methods' },
    { href: '/reports', icon: 'bi-bar-chart-line', label: 'Reports' },
    { href: '/wizard-setup', icon: 'bi-magic', label: 'Wizard Setup' },
    { href: '/settings', icon: 'bi-gear', label: 'Settings' },
];

const Menu = ({ mobileOnClick, closeMenu, isCollapsed, toggleSidebar }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        const loadSummary = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/dashboard/navigation-summary`, { headers: { Authorization: `Bearer ${token}` } });
                setPendingCount(response.data.pendingCount || 0);
            } catch (error) {
                setPendingCount(0);
            }
        };
        loadSummary();
        router.events.on('routeChangeComplete', loadSummary);
        return () => router.events.off('routeChangeComplete', loadSummary);
    }, [router.events]);

    const handleLinkClick = () => {
        // Close menu on mobile when a link is clicked
        if (typeof window !== 'undefined' && window.innerWidth <= 992 && mobileOnClick) {
            mobileOnClick();
        }
    };

    const handleLogoClick = (e) => {
        // If on dashboard and menu is open, close the menu instead of navigating
        if (router.pathname === '/dashboard' && closeMenu) {
            e.preventDefault();
            closeMenu();
        } else {
            // Close menu on mobile when navigating
            handleLinkClick();
        }
    };

    return (
        <div className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.brandRow}>
            <Link href="/dashboard" className={styles.logoLink} onClick={handleLogoClick}>
                <div className={styles.logoContainer}>
                    <Image
                        src="/img/logo3.0-removebg-preview.png"
                        alt={WEBSITE_NAME}
                        width={80}
                        height={80}
                        className={styles.logoImg}
                    />
                </div>
                <span className={styles.brandName}>Ebisu<small>{t('Expense tracker')}</small></span>
            </Link>
            <button className={styles.collapseButton} type="button" onClick={toggleSidebar} aria-label={isCollapsed ? t('Expand navigation') : t('Collapse navigation')}>
                <i className={`bi ${isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`} aria-hidden="true" />
            </button>
            </div>
            <nav className={styles.navigation} aria-label={t('Main navigation')}>
                {menuItems.map((item, index) => (
                    <Link className={`${styles.menuLink} ${router.pathname === item.href ? styles.active : ''}`} key={index} href={item.href} onClick={handleLinkClick} title={isCollapsed ? t(item.label) : undefined}>
                            <div className={styles.menuItemWrapper}>
                                <div><i className={`bi ${item.icon}`}></i></div>
                                <div>{t(item.label)}</div>
                                {item.href === '/pendingExpenses' && pendingCount > 0 && <span className={styles.pendingBadge}>{pendingCount}</span>}
                            </div>
                    </Link>
                ))}
            </nav>
            <Link href="/myaccount" className={styles.profileLink} onClick={handleLinkClick} title={isCollapsed ? t('My Account') : undefined}>
                <span className={styles.profileAvatar}>{user?.firstname?.[0] || 'E'}{user?.lastname?.[0] || ''}</span>
                <span className={styles.profileCopy}><strong>{user ? `${user.firstname} ${user.lastname}` : t('My Account')}</strong><small>{t('My account')}</small></span>
                <i className="bi bi-chevron-right" aria-hidden="true" />
            </Link>
        </div>
    );
};

export default Menu;
