import { useEffect, useRef } from 'react';

export default function useModalBackButton(isOpen, onClose) {
    const stateId = useRef(`modal-${Math.random().toString(36).slice(2)}`);
    const pushed = useRef(false);

    useEffect(() => {
        if (!isOpen || typeof window === 'undefined') return undefined;
        window.history.pushState({ ...(window.history.state || {}), modalId: stateId.current }, '');
        pushed.current = true;
        const closeFromBack = () => {
            pushed.current = false;
            onClose();
        };
        window.addEventListener('popstate', closeFromBack, { once: true });
        const app = window.Capacitor?.Plugins?.App;
        let backButtonListener;
        app?.addListener?.('backButton', closeFromBack).then((listener) => {
            backButtonListener = listener;
        });

        return () => {
            window.removeEventListener('popstate', closeFromBack);
            backButtonListener?.remove();
        };
    }, [isOpen, onClose]);

    const closeModal = () => {
        if (pushed.current && typeof window !== 'undefined' && window.history.state?.modalId === stateId.current) {
            pushed.current = false;
            window.history.back();
        }
        onClose();
    };

    return closeModal;
}
