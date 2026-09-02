import styles from '@/Components/Expenses/Expenses.module.scss';
import React from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import ExpensesGridItem from "@/Components/Expenses/View/ExpenseGridItem";
import Link from 'next/link';

const ExpensesGrid = ({ expenses, expensesNextMonth, monthText, nextMonthText, onAddExpensePayment, showNextMonth = true, monthEdits, setMonthEdits, onSaveMonthEdits }) => {
    const { t } = useTranslation();

    const totalsByCurrency = (items) => items.reduce((totals, expense) => {
        const key = expense.currency_id;
        if (!totals[key]) totals[key] = { symbol: expense.currency_symbol, amount: 0 };
        totals[key].amount += Number(expense.amount || 0);
        return totals;
    }, {});
    const groupCreditExpenses = (items) => {
        const groups = new Map();
        const purchasesByCard = items.filter((expense) => expense.is_credit_card_purchase && expense.payment_method_id).reduce((purchases, expense) => {
            const key = `${expense.payment_method_id}:${expense.currency_id}`;
            purchases[key] = (purchases[key] || 0) + Number(expense.amount || 0);
            return purchases;
        }, {});
        items.forEach((expense) => {
            const key = expense.is_credit_card_purchase ? `expense-${expense.id}-${expense.expense_amount_id}` : expense.payment_method_id ? `credit-${expense.payment_method_id}` : `expense-${expense.id}-${expense.expense_amount_id}`;
            const group = groups.get(key) || { ...expense, currencyAmounts: [] };
            if (expense.payment_method_id && !expense.is_credit_card_purchase) Object.assign(group, expense);
            group.currencyAmounts.push(expense);
            groups.set(key, group);
        });
        return Array.from(groups.values()).map((group) => {
            if (!group.payment_method_id || group.is_credit_card_purchase || !group.currencyAmounts.some((amount) => Number(amount.amount) !== 0 || purchasesByCard[`${group.payment_method_id}:${amount.currency_id}`])) return group;
            const amountsByCurrency = new Map();
            group.currencyAmounts.forEach((amount) => {
                const current = amountsByCurrency.get(amount.currency_id) || { ...amount, amount: 0, purchaseTotal: 0, statementAmount: 0 };
                if (amount.is_credit_card_purchase) current.purchaseTotal += Number(amount.amount || 0);
                else current.statementAmount += Number(amount.amount || 0);
                amountsByCurrency.set(amount.currency_id, current);
            });
            return {
                ...group,
                currencyAmounts: Array.from(amountsByCurrency.values()).map((amount) => ({ ...amount, amount: Math.max(amount.statementAmount, amount.purchaseTotal, purchasesByCard[`${group.payment_method_id}:${amount.currency_id}`] || 0) })).filter((amount) => Number(amount.amount) !== 0),
            };
        });
    };
    const renderTotal = (items) => <div className={styles.expensePanelTotal}><strong>{t('Total')}</strong><span>{Object.values(totalsByCurrency(items)).map((total) => <b key={total.symbol}>{total.symbol} {total.amount.toFixed(2)}</b>)}</span></div>;

    return (
        <div>
            <div className={styles.expenseGridContainer}>
                <div className={styles.dashboardExpensePanel}>
                    <div className={styles.expenseGridContainerMonthText}>
                        <span>{t(monthText)}</span><span>{Object.keys(monthEdits || {}).length > 0 && <button type="button" className={styles.updateMonthButton} onClick={onSaveMonthEdits}>{t('Update Month')}</button>}<Link href="/expenses">{t('View All')}</Link></span>
                    </div>
                    {groupCreditExpenses(expenses).map((expense) => (
                        <ExpensesGridItem key={'grid_item_' + expense.id + '_' + expense.expense_amount_id} expense={expense} onAddExpensePayment={onAddExpensePayment} monthEdits={monthEdits} setMonthEdits={setMonthEdits} />
                    ))}
                    {renderTotal(expenses)}
                </div>
                {showNextMonth && <div className={styles.dashboardExpensePanel}>
                    <div className={styles.expenseGridContainerMonthText}>
                        <span>{t(nextMonthText)}</span><Link href="/expenses">{t('View All')}</Link>
                    </div>
                    {groupCreditExpenses(expensesNextMonth).map((expense) => (
                        <ExpensesGridItem
                            key={'grid_item_nm_' + expense.id + '_' + expense.expense_amount_id}
                            expense={expense}
                            onAddExpensePayment={onAddExpensePayment}
                            isNextMonth={true}
                        />
                    ))}
                    {renderTotal(expensesNextMonth)}
                </div>}
            </div>
        </div>
    );
};

export default ExpensesGrid;
