import React from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import { useRouter } from 'next/router';
import ExpensePayment from '@/Components/Expenses/ExpensePayment';
import ProgressBar from '@/Components/UI/ProgressBar/ProgressBar';
import listStyles from '@/Components/UI/ManagementList.module.scss';
import styles from './PendingExpenses.module.scss';

const PendingExpenses = ({ expenses, onAddExpensePayment }) => {
    const { t } = useTranslation();
    const router = useRouter();
    return <div className={listStyles.surface}>{expenses.length ? expenses.map((expense) => {
        const isPaid = Boolean(expense.isTotalPaid);
        const categoryColor = expense.category_color || expense.expense_amounts?.[0]?.category_color || '#809297';
        return <div className={listStyles.row} key={expense.id}><button type="button" className={listStyles.icon} style={{ color: categoryColor, backgroundColor: `${categoryColor}22` }} onClick={() => router.push(`/expenses/details/${expense.id}`)} aria-label={t('Edit')}><i className={expense.category_icon || 'bi bi-receipt'} aria-hidden="true" /></button><button type="button" className={listStyles.rowContent} onClick={() => router.push(`/expenses/details/${expense.id}`)}><span className={listStyles.primary}><i className={styles.categoryDot} style={{ backgroundColor: categoryColor }} />{expense.name}</span><span className={listStyles.meta}>{expense.formattedDueDate}{expense.expense_amounts?.map((item) => {
            const total = Number(item.amount || 0);
            const paid = Number(item.paymentTotal || 0);
            const itemIsPaid = Boolean(item.isFullPaid) || paid >= total;
            return <span className={styles.currencyAmount} key={item.expense_amount_id || item.id}>{item.currency_symbol} {paid.toFixed(2)} / {total.toFixed(2)}<ProgressBar value={paid} maxValue={total} isFullPaid={itemIsPaid} /></span>;
        })}</span></button><span className={isPaid ? listStyles.badge : listStyles.pendingBadge}>{isPaid ? t('Paid') : t('Pending')}</span>{!isPaid && <ExpensePayment expense={expense} onAddExpensePayment={onAddExpensePayment} renderTrigger={(open) => <button type="button" className={listStyles.pay} onClick={open}>{t('Pay')}</button>} />}</div>;
    }) : <div className={styles.emptyState}><i className="bi bi-check2-circle" aria-hidden="true" /><strong>{t('No expenses to show.')}</strong><span>{t('There are no expenses matching this status.')}</span></div>}</div>;
};

export default PendingExpenses;
