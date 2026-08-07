import styles from '@/Components/Expenses/Expenses.module.scss';
import React from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import ExpensesGridItem from "@/Components/Expenses/View/ExpenseGridItem";
import Link from 'next/link';

const ExpensesGrid = ({ expenses, expensesNextMonth, monthText, nextMonthText, onAddExpensePayment, showNextMonth = true }) => {
    const { t } = useTranslation();

    const totalsByCurrency = (items) => items.reduce((totals, expense) => {
        const key = expense.currency_id;
        if (!totals[key]) totals[key] = { symbol: expense.currency_symbol, amount: 0 };
        totals[key].amount += Number(expense.amount || 0);
        return totals;
    }, {});
    const renderTotal = (items) => <div className={styles.expensePanelTotal}><strong>{t('Total')}</strong><span>{Object.values(totalsByCurrency(items)).map((total) => <b key={total.symbol}>{total.symbol} {total.amount.toFixed(2)}</b>)}</span></div>;

    return (
        <div>
            <div className={styles.expenseGridContainer}>
                <div className={styles.dashboardExpensePanel}>
                    <div className={styles.expenseGridContainerMonthText}>
                        <span>{t(monthText)}</span><Link href="/expenses">{t('View All')}</Link>
                    </div>
                    {expenses.map((expense) => (
                        <ExpensesGridItem key={'grid_item_' + expense.id + '_' + expense.expense_amount_id} expense={expense} onAddExpensePayment={onAddExpensePayment} />
                    ))}
                    {renderTotal(expenses)}
                </div>
                {showNextMonth && <div className={styles.dashboardExpensePanel}>
                    <div className={styles.expenseGridContainerMonthText}>
                        <span>{t(nextMonthText)}</span><Link href="/expenses">{t('View All')}</Link>
                    </div>
                    {expensesNextMonth.map((expense) => (
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
