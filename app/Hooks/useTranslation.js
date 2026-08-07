import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
export function useTranslation() {
    const [locale, setLocale] = useState('en');
    const changeLocale = (newLocale) => {
        setLocale(newLocale);
        Cookies.set('locale', newLocale, { expires: 365 });
    };
    useEffect(() => {
        const cookieLocale = Cookies.get('locale');
        if (cookieLocale) {
            setLocale(cookieLocale);
        }
    }, []);
    const t = (key, params = {}) => {
        const translation = require(`../Locales/${locale}.json`);
        let translatedText = translation[key] || key;
        for (const param in params) {
            translatedText = translatedText.replace(`{${param}}`, params[param]);
        }
        return translatedText;
    };
    return { locale, changeLocale, t };
}
