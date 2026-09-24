import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from '@/Hooks/useTranslation';
import tableStyles from '@/Components/Expenses/ExpensesWorkspace.module.scss';
import styles from './ExpensePaymentsList.module.scss';

const CreditPurchasesList = ({ purchases = [] }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }) : '—';

    return <section className={`${tableStyles.listPanel} ${styles.paymentHistory}`}>
        <header className={styles.historyHeader}><div><h2>{t('Credit Purchases')}</h2><p>{purchases.length ? `${purchases.length} ${t('purchases charged to this card.')}` : t('No purchases have been charged to this card this month.')}</p></div></header>
        {purchases.length ? <div className={`${tableStyles.table} ${styles.paymentTable}`} role="table" aria-label={t('Credit purchases')}><div className={`${tableStyles.tableRow} ${tableStyles.tableHead}`} role="row"><span>{t('Date')}</span><span>{t('Description')}</span><span>{t('Category')}</span><span>{t('Amount')}</span></div>{purchases.map((purchase) => <button key={purchase.expense_amount_id} type="button" className={tableStyles.tableRow} onClick={() => router.push(`/expenses/details/${purchase.expense_id}`)}><span>{formatDate(purchase.due_date)}</span><span className={`${tableStyles.description} ${styles.paymentDescription}`}><i className={purchase.category_icon || 'bi bi-credit-card'} aria-hidden="true" /><span><strong>{purchase.name}</strong><small>{t('Charged to this card')}</small></span></span><span className={tableStyles.categoryChip}>{purchase.category_name || t('Other')}</span><span>{purchase.currency_symbol} {purchase.amount.toFixed(2)}</span></button>)}</div> : <div className={styles.emptyState}><i className="bi bi-credit-card" aria-hidden="true" /><p>{t('No purchases have been charged to this card this month.')}</p></div>}
    </section>;
};

export default CreditPurchasesList;
