import styles from '@/Components/Expenses/Expenses.module.scss';
import React, { useRef, useState } from "react";
import { useTranslation } from '@/Hooks/useTranslation';
import ExpensesPayment from "@/Components/Expenses/ExpensePayment";
import ProgressBar from "@/Components/UI/ProgressBar/ProgressBar";
import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import { useRouter } from 'next/router';

const ExpensesGridItem = ({ expense, onAddExpensePayment, isNextMonth, showAll, monthEdits, setMonthEdits }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const currencyAmounts = expense.currencyAmounts || [expense];
    const isCreditCardPurchase = Boolean(expense.is_credit_card_purchase);
    const isMultiCurrencyCredit = currencyAmounts.length > 1;
    const currencyProgress = currencyAmounts.map((amount) => {
        const total = Number(amount.amount || 0);
        const paid = Number(amount.paymentTotal || 0);
        return { ...amount, total, paid, percentage: total > 0 ? Math.min(100, (paid / total) * 100) : 0 };
    });
    const paidAmount = currencyProgress.reduce((sum, amount) => sum + amount.paid, 0);
    const totalAmount = currencyProgress.reduce((sum, amount) => sum + amount.total, 0);
    const isPaid = totalAmount > 0 && currencyProgress.every((amount) => amount.paid >= amount.total);
    const percentage = totalAmount > 0 ? Math.min(100, (paidAmount / totalAmount) * 100) : 0;
    const [isEditing, setIsEditing] = useState(false);
    const [displayAmount, setDisplayAmount] = useState(totalAmount);
    const [draftAmount, setDraftAmount] = useState('');
    const ignoreNextRowClick = useRef(false);
    const canEdit = !isNextMonth && [2, 3].includes(Number(expense.type_id)) && !isMultiCurrencyCredit;
    const editValue = monthEdits?.[expense.id]?.amounts?.[expense.expense_amount_id]?.amount ?? totalAmount;
    const updateAmount = (value) => setMonthEdits((current) => ({ ...current, [expense.id]: { expenseId: expense.id, amounts: { ...(current[expense.id]?.amounts || {}), [expense.expense_amount_id]: { expenseAmountId: expense.expense_amount_id, amount: value } } } }));
    const finishEditing = async () => {
        ignoreNextRowClick.current = true;
        setIsEditing(false);
        const nextAmount = Number(draftAmount);
        if (!Number.isFinite(nextAmount) || nextAmount < 0 || nextAmount === totalAmount) return;
        setDisplayAmount(nextAmount);
        const token = localStorage.getItem('token');
        const date = new Date();
        if (isNextMonth) date.setMonth(date.getMonth() + 1);
        await axios.post(`${API_BASE_URL}/updateExpenseMonthAmounts`, {
            expenseId: expense.id,
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            amounts: [{ expenseAmountId: expense.expense_amount_id, amount: nextAmount }],
        }, { headers: { Authorization: `Bearer ${token}` } });
    };

    return (
        <div>
            <ExpensesPayment
                expense={expense}
                onAddExpensePayment={onAddExpensePayment}
                isNextMonth={isNextMonth}
                renderTrigger={(openPayment) => (
                    <button type="button" className={styles.expenseGridCard} onClick={(event) => { if (isCreditCardPurchase) { router.push(`/expenses/details/${expense.id}`); return; } if (event.target.closest(`.${styles.amountGrid}`)) return; if (ignoreNextRowClick.current) { ignoreNextRowClick.current = false; return; } if (isEditing) { finishEditing(); return; } openPayment(); }}>
                        <span className={styles.expenseCategoryIcon} style={{ color: expense.category_color || '#809297', backgroundColor: `${expense.category_color || '#809297'}22` }}><i className={expense.category_icon || 'bi bi-receipt'} aria-hidden="true" /></span>
                        <span className={styles.expenseRowDetails}><strong><span className={styles.expenseName}><i className={styles.categoryDot} style={{ backgroundColor: expense.category_color || '#809297' }} />{t(expense.name)}</span>{isCreditCardPurchase && expense.creditCardStatementName && <small className={styles.creditCardBadge}><i className="bi bi-credit-card" aria-hidden="true" />{t(expense.creditCardStatementName)}</small>}</strong><small>{showAll ? t(expense.dueDateDay) : t(expense.formattedGridDueDate)}</small></span>
                        <span className={`${styles.amountGrid} ${isMultiCurrencyCredit ? styles.multiCurrencyAmount : ''} ${!isPaid ? styles.pendingAmountGrid : ''}`}>{currencyAmounts.map((amount) => <span key={amount.expense_amount_id} onClick={(event) => { if (!canEdit) return; event.stopPropagation(); setDraftAmount(String(amount.amount)); setIsEditing(true); }}>{amount.currency_symbol} {isEditing && Number(amount.expense_amount_id) === Number(expense.expense_amount_id) ? <input className={styles.dashboardInlineAmount} autoFocus type="number" min="0" step="0.01" value={draftAmount} onFocus={(event) => event.target.select()} onClick={(event) => event.stopPropagation()} onChange={(event) => { setDraftAmount(event.target.value); updateAmount(event.target.value); }} onBlur={finishEditing} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); if (event.key === 'Escape') { ignoreNextRowClick.current = false; setIsEditing(false); } }} /> : Number(amount.amount || displayAmount).toFixed(2)}</span>)}</span>
                        <span className={`${styles.paymentStatus} ${isPaid ? styles.statusPaid : styles.statusPending}`}>{isPaid ? t(isCreditCardPurchase ? 'Paid by credit' : 'Paid') : t('Pending')}</span>
                        {!showAll && <span className={styles.paymentProgress}><span className={isMultiCurrencyCredit ? styles.multiCurrencyProgress : undefined}>{currencyProgress.map((amount) => <b key={amount.expense_amount_id}>{amount.currency_symbol} {amount.paid.toFixed(2)} / {amount.total.toFixed(2)} · {amount.percentage.toFixed(0)}%</b>)}</span><ProgressBar value={paidAmount} maxValue={totalAmount || 1} isFullPaid={isPaid} /></span>}
                    </button>
                )}
            />
        </div>
    );
};

export default ExpensesGridItem;
