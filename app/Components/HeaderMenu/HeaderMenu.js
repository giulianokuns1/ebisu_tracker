import React from 'react';
import styles from './HeaderMenu.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { WEBSITE_NAME } from '@/constants';
import Hamburger from 'hamburger-react';

const HeaderMenu = ({ isMenuOpen, closeMenu, toggleMenu }) => {
    const router = useRouter();

    const handleLogoClick = (e) => {
        // If on dashboard and menu is open, close the menu instead of navigating
        if (router.pathname === '/dashboard' && isMenuOpen && closeMenu) {
            e.preventDefault();
            closeMenu();
        }
    };

    return (
        <div className={styles.headerMenu}>
            <div className={styles.mobileHeaderContent}>
                <button type="button" className={styles.hamburgerButton} onClick={toggleMenu} aria-label="Toggle navigation"><Hamburger size={20} toggled={isMenuOpen} /></button>
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
                </Link>
                <div className={styles.hamburgerSpacer}></div>
            </div>
        </div>
    );
};

export default HeaderMenu;
