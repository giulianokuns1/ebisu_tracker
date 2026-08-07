import styles from '@/Components/Expenses/Expenses.module.scss';
import React from "react";
import { useTranslation } from '@/Hooks/useTranslation';
import ExpensesPayment from "@/Components/Expenses/ExpensePayment";
import ProgressBar from "@/Components/UI/ProgressBar/ProgressBar";

const ExpensesGridItem = ({ expense, onAddExpensePayment, isNextMonth, showAll }) => {
    const { t } = useTranslation();
    const paidAmount = Number(expense.paymentTotal || 0);
    const totalAmount = Number(expense.amount || 0);
    const isPaid = Boolean(expense.isFullPaid) || paidAmount >= totalAmount;
    const percentage = totalAmount ? Math.min(100, (paidAmount / totalAmount) * 100) : 0;

    return (
        <div>
            <ExpensesPayment
                expense={expense}
                onAddExpensePayment={onAddExpensePayment}
                isNextMonth={isNextMonth}
                renderTrigger={(openPayment) => (
                    <button type="button" className={styles.expenseGridCard} onClick={openPayment}>
                        <span className={styles.expenseCategoryIcon}><i className={expense.category_icon || 'bi bi-receipt'} aria-hidden="true" /></span>
                        <span className={styles.expenseRowDetails}><strong>{t(expense.name)}</strong><small>{showAll ? t(expense.dueDateDay) : t(expense.formattedGridDueDate)}</small></span>
                        <span className={styles.amountGrid}>{expense.currency_symbol} {totalAmount.toFixed(2)}</span>
                        <span className={`${styles.paymentStatus} ${isPaid ? styles.statusPaid : styles.statusPending}`}>{isPaid ? t('Paid') : t('Pending')}</span>
                        {!showAll && <span className={styles.paymentProgress}><span>{expense.currency_symbol} {paidAmount.toFixed(2)} / {totalAmount.toFixed(2)} · {percentage.toFixed(0)}%</span><ProgressBar value={paidAmount} maxValue={totalAmount} isFullPaid={isPaid} /></span>}
                    </button>
                )}
            />
        </div>
    );
};

export default ExpensesGridItem;
