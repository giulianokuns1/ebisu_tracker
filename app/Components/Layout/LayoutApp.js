import React, { useEffect, useRef, useState } from 'react';
import styles from './LayoutApp.module.scss';
import Menu from '@/Components/Menu/Menu';
import Head from 'next/head';
import { useTranslation } from "@/Hooks/useTranslation";
import Notification from "@/Components/UI/Notification";
import { Toast } from "primereact/toast";
import HeaderMenu from "@/Components/HeaderMenu/HeaderMenu";
import AppFooter from "@/Components/Layout/AppFooter";
import QuickActions from '@/Components/QuickActions/QuickActions';

export default function LayoutApp({ children, fullWidth = false }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [notificationType, setNotificationType] = useState(false);
    const [message, setMessage] = useState('');
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const isSwiping = useRef(false);
    const isMenuOpenRef = useRef(false);

    const { t } = useTranslation();
    const notificationToast = useRef(null);
    const closeMessage = () => {
        setShowMessage(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen((prevIsMenuOpen) => {
            isMenuOpenRef.current = !prevIsMenuOpen;
            return !prevIsMenuOpen;
        });
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        isMenuOpenRef.current = false;
    };

    const openMenu = () => {
        setIsMenuOpen(true);
        isMenuOpenRef.current = true;
    };

    // Update ref when state changes
    useEffect(() => {
        isMenuOpenRef.current = isMenuOpen;
    }, [isMenuOpen]);

    const handleTouchStart = (e) => {
        // Only handle swipe on mobile
        if (window.innerWidth > 992) return;

        const touch = e.touches[0];
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
        isSwiping.current = false;

        // Give mobile users a forgiving left-side gesture zone without catching every swipe.
        if (!isMenuOpenRef.current && touch.clientX <= window.innerWidth * 0.25) {
            isSwiping.current = true;
        }

        if (isMenuOpenRef.current) {
            isSwiping.current = true;
        }
    };

    const handleTouchMove = (e) => {
        if (!isSwiping.current || !touchStartX.current) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX.current;
        const deltaY = Math.abs(touch.clientY - touchStartY.current);

        // Only proceed if horizontal movement is greater than vertical (swipe gesture)
        if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 50) {
            if (!isMenuOpenRef.current && deltaX > 0) {
                openMenu();
                isSwiping.current = false;
            }

            if (isMenuOpenRef.current && deltaX < 0) {
                closeMenu();
                isSwiping.current = false;
            }
        }
    };

    const handleTouchEnd = () => {
        touchStartX.current = null;
        touchStartY.current = null;
        isSwiping.current = false;
    };

    useEffect(() => {
        // Add touch event listeners to document for swipe detection
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);


    useEffect(() => {
        const notification = localStorage.getItem('notification');
        const notificationMessage = localStorage.getItem('notificationMessage');
        const notificationType = localStorage.getItem('notificationType');

        if (notificationMessage) {
            setMessage(t(notificationMessage));
            setShowMessage(true);
            setNotificationType(notificationType);

            localStorage.removeItem('notificationMessage');
            localStorage.removeItem('notificationType');
        }
        if (notification) {
            notificationToast.current.show(JSON.parse(notification));
            localStorage.removeItem('notification');
        }
    }, [t]);

    return (
        <div className={styles.appContainer}>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <div className={`${styles.container} ${isMenuOpen ? styles.menuOpen : ''} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
                {isMenuOpen && (
                    <div className={styles.backdrop} onClick={closeMenu} />
                )}
                <div className={`${styles.menu} ${isMenuOpen ? styles.menuVisible : ''}`}>
                    <Menu mobileOnClick={toggleMenu} closeMenu={closeMenu} isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed((value) => !value)} />
                </div>
                <div className={styles.mainContent}>
                    <HeaderMenu isMenuOpen={isMenuOpen} closeMenu={closeMenu} toggleMenu={toggleMenu} />
                    <div className={styles.content}>
                        <Toast ref={notificationToast} position={'top-center'} />
                        <div className={`${styles.pageContent} ${fullWidth ? styles.pageContentFullWidth : ''}`}>{children}</div>
                    </div>
                    <AppFooter />
                    <QuickActions />
                </div>
                {showMessage && <Notification message={message} onClose={closeMessage} type={notificationType} />}
            </div>
        </div>
    );
}
