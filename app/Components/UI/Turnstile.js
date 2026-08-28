import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Script from 'next/script';

const Turnstile = forwardRef(({ onVerify, onExpire, onError }, ref) => {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const pendingExecutionRef = useRef(null);
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    const rejectPendingExecution = (error) => {
        if (!pendingExecutionRef.current) return;
        pendingExecutionRef.current.reject(error);
        pendingExecutionRef.current = null;
    };

    const handleVerify = (token) => {
        onVerify(token);
        if (!pendingExecutionRef.current) return;
        pendingExecutionRef.current.resolve(token);
        pendingExecutionRef.current = null;
    };

    const handleExpire = () => {
        onExpire();
        rejectPendingExecution(new Error('Security verification expired. Please try again.'));
    };

    const handleError = () => {
        onError();
        rejectPendingExecution(new Error('Security verification unavailable. Please try again.'));
    };

    const renderWidget = () => {
        if (!siteKey || !containerRef.current || !window.turnstile || widgetIdRef.current !== null) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: handleVerify,
            'expired-callback': handleExpire,
            'error-callback': handleError,
            theme: 'dark',
            size: 'invisible',
            execution: 'execute',
        });
    };

    useImperativeHandle(ref, () => ({
        execute: () => {
            if (!siteKey) return Promise.resolve('');
            if (!window.turnstile || widgetIdRef.current === null) {
                return Promise.reject(new Error('Security verification is still loading. Please try again.'));
            }
            rejectPendingExecution(new Error('Security verification was restarted. Please try again.'));
            return new Promise((resolve, reject) => {
                pendingExecutionRef.current = { resolve, reject };
                window.turnstile.reset(widgetIdRef.current);
                window.turnstile.execute(widgetIdRef.current);
            });
        },
    }), [siteKey]);

    useEffect(() => {
        renderWidget();
        return () => {
            rejectPendingExecution(new Error('Security verification was cancelled.'));
            if (window.turnstile && widgetIdRef.current !== null) window.turnstile.remove(widgetIdRef.current);
        };
    }, []);

    if (!siteKey) return null;

    return <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={renderWidget} /><div ref={containerRef} /></>;
});

Turnstile.displayName = 'Turnstile';

export default Turnstile;
