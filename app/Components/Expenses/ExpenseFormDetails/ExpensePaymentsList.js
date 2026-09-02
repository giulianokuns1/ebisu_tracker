import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from '@/Hooks/useTranslation';
import tableStyles from '@/Components/Expenses/ExpensesWorkspace.module.scss';
import styles from './ExpensePaymentsList.module.scss';

const pageSizeOptions = [10, 25, 50];

export default function ExpensePaymentsList({ payments = [] }) {
    const { t } = useTranslation();
    const router = useRouter();
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const pageCount = Math.max(1, Math.ceil(payments.length / pageSize));
    const page = Math.min(currentPage, pageCount);
    const firstPayment = (page - 1) * pageSize;
    const visiblePayments = payments.slice(firstPayment, firstPayment + pageSize);
    const formatDate = (value) => new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });

    const updatePageSize = (event) => {
        setPageSize(Number(event.target.value));
        setCurrentPage(1);
    };

    return <section className={`${tableStyles.listPanel} ${styles.paymentHistory}`}>
        <header className={styles.historyHeader}>
            <div><h2>{t('Payment History')}</h2><p>{payments.length ? `${t('Showing')} ${firstPayment + 1}-${Math.min(firstPayment + pageSize, payments.length)} ${t('of')} ${payments.length} ${t('entries')}` : t('No payments have been recorded for this expense.')}</p></div>
            <label className={styles.pageSize}>{t('Rows per page')}<select value={pageSize} onChange={updatePageSize}>{pageSizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        </header>
        {payments.length ? <>
            <div className={`${tableStyles.table} ${styles.paymentTable}`} role="table" aria-label={t('Expense payments')}>
                <div className={`${tableStyles.tableRow} ${tableStyles.tableHead}`} role="row"><span>{t('Date')}</span><span>{t('Description')}</span><span>{t('Category')}</span><span>{t('Amount')}</span><span>{t('Status')}</span><span className={styles.actionsHeader}>{t('Actions')}</span></div>
                {visiblePayments.map((payment) => <button key={payment.id} type="button" className={tableStyles.tableRow} onClick={() => { if (!payment.is_credit_allocation) router.push(`/payments/details/${payment.id}`); }}>
                    <span>{formatDate(payment.created_at)}</span>
                    <span className={`${tableStyles.description} ${styles.paymentDescription}`}><i className={payment.category_icon || 'bi bi-credit-card'} aria-hidden="true" /><span><strong>{payment.expense_name || t('Payment')}</strong><small>{payment.is_credit_allocation ? `${t('Paid by credit')} · ${payment.statement_expense_name || payment.payment_method_name}` : ([payment.payment_method_name, payment.comment].filter(Boolean).join(' · ') || '—')}</small></span></span>
                    <span className={tableStyles.categoryChip}>{payment.category_name || t('Other')}</span>
                    <span className={tableStyles.paidAmount}>{payment.currency_symbol} {Number(payment.amount || 0).toFixed(2)}</span>
                    <span className={tableStyles.paidStatus}>{t('Paid')}</span>
                    <span className={`${tableStyles.edit} ${payment.is_credit_allocation ? styles.creditPaymentAction : ''}`}>{payment.is_credit_allocation ? <span className={styles.creditPaymentBadge}><i className="bi bi-credit-card" aria-hidden="true" />{payment.statement_expense_name || payment.payment_method_name}</span> : <><i className="bi bi-pencil" aria-hidden="true" /><span className="visually-hidden">{t('Edit')}</span></>}</span>
                </button>)}
            </div>
            {pageCount > 1 && <nav className={styles.pagination} aria-label={t('Payment history pages')}><button type="button" onClick={() => setCurrentPage(page - 1)} disabled={page === 1}><i className="bi bi-chevron-left" aria-hidden="true" /> {t('Previous')}</button><span>{t('Page')} {page} {t('of')} {pageCount}</span><button type="button" onClick={() => setCurrentPage(page + 1)} disabled={page === pageCount}>{t('Next')} <i className="bi bi-chevron-right" aria-hidden="true" /></button></nav>}
        </> : <div className={styles.emptyState}><i className="bi bi-receipt" aria-hidden="true" /><p>{t('No payments have been recorded for this expense.')}</p></div>}
    </section>;
}
