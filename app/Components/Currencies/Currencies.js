import React from 'react';
import { useRouter } from 'next/router';
import listStyles from '@/Components/UI/ManagementList.module.scss';
import styles from './Currencies.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';

const Currencies = ({ userCurrencies }) => {
    const router = useRouter();
    const { t } = useTranslation();
    return (
        <div className={listStyles.surface}>
            {userCurrencies.length ? userCurrencies.map((currency) => (
                <button type="button" key={currency.id} className={listStyles.row} onClick={() => router.push(`/currencies/details/${currency.id}`)}><span className={listStyles.icon}>{currency.custom_symbol || currency.currency_symbol}</span><span className={listStyles.primary}>{currency.custom_name || currency.currency_name}</span><span className={listStyles.badge}>{currency.is_default ? 'Default' : 'Active'}</span><i className={`bi bi-pencil ${listStyles.edit}`} aria-hidden="true" /></button>
            )) : <div className={styles.emptyState}><i className="bi bi-currency-exchange" aria-hidden="true" /><strong>{t('No custom currencies yet.')}</strong><span>{t('Add a currency to start tracking your money in it.')}</span></div>}
        </div>
    );
};

export default Currencies;
