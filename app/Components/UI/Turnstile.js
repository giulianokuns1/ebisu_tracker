import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

const Turnstile = ({ onVerify, onExpire, onError }) => {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    const renderWidget = () => {
        if (!siteKey || !containerRef.current || !window.turnstile || widgetIdRef.current !== null) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            'expired-callback': onExpire,
            'error-callback': onError,
            theme: 'dark',
        });
    };

    useEffect(() => {
        renderWidget();
        return () => {
            if (window.turnstile && widgetIdRef.current !== null) window.turnstile.remove(widgetIdRef.current);
        };
    }, []);

    if (!siteKey) return null;

    return <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={renderWidget} /><div className="turnstileWidget" ref={containerRef} /></>;
};

export default Turnstile;
