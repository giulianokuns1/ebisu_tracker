import styles from './Payments.module.scss';
import React, { useRef } from "react";
import { useTranslation } from '@/Hooks/useTranslation';
import { useRouter } from "next/router";
import listStyles from '@/Components/UI/ManagementList.module.scss';

const Payments = ({ payments, embeddedInForm }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            timeZone: 'UTC',
        });
    };
    const handleEditPayment = (paymentId) => {
        router.push('/payments/details/' + paymentId);
    }
    return (
        <div className={embeddedInForm ? styles.embeddedInForm : undefined}>
            <div className={listStyles.surface}>
                {payments.length ? payments.map((payment) => (
                    <button key={payment.id} type="button" className={listStyles.row} onClick={() => handleEditPayment(payment.id)}>
                        <span className={listStyles.icon} style={{ color: payment.category_color || '#809297', backgroundColor: `${payment.category_color || '#809297'}22` }}><i className={payment.category_icon || 'bi bi-credit-card'} aria-hidden="true" /></span>
                        <span><span className={listStyles.primary}>{payment.expense_name}</span><span className={listStyles.meta}>{formatDate(payment.created_at)} · {payment.payment_method_name || '—'} · {payment.comment || '—'}</span></span>
                        <span className={listStyles.amount}>{payment.currency_symbol} {payment.amount}</span><i className={`bi bi-pencil ${listStyles.edit}`} aria-hidden="true" />
                    </button>
                )) : <div className={styles.emptyState}><i className="bi bi-cash-coin" aria-hidden="true" /><strong>{t('No payments yet.')}</strong><span>{t('Add a payment to start tracking your transactions.')}</span></div>}
            </div>
        </div>
    );
};

export default Payments;
