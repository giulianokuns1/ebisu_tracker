import React from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import Button from "@/Components/UI/Button";
import styles from './LanguageSwitcher.module.scss';

const LanguageSwitcher = ({ mode = 'buttons' }) => {
    const { locale, changeLocale } = useTranslation();
    const { t } = useTranslation();

    const handleLanguageChange = (newLocale) => {
        changeLocale(newLocale);
        window.location.reload();
    };

    if (mode === 'select') {
        return (
            <div className={styles.selectContainer}>
                <select
                    className={styles.languageSelect}
                    value={locale}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                >
                    <option value="en">{t('English')}</option>
                    <option value="es">{t('Spanish')}</option>
                </select>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Button onClick={() => handleLanguageChange('en')} label={ t('English') }/>
            <Button onClick={() => handleLanguageChange('es')} label={ t('Spanish') }/>
        </div>
    );
};

export default LanguageSwitcher;
