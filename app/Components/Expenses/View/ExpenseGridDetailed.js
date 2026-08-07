import styles from '@/Components/Expenses/Expenses.module.scss';
import React from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import ExpensesGridItem from "@/Components/Expenses/View/ExpenseGridItem";
import ExpensesDetails from "@/Components/Expenses/ExpensesDetails";
import Link from 'next/link';
const ExpensesGridDetailed = ({ expenses, monthText, expensesAmountByCurrency, data, onAddExpensePayment, showAll }) => {
    const { t } = useTranslation();
    return (
        <div>
            <div className={styles.expenseGridDetialedContainer}>
                <div className={styles.expenseGridDetailedExpenses}>
                    <div className={styles.expenseGridContainerMonthText}>
                        {t(monthText)}
                    </div>
                    {expenses.length === 0 && (
                        <div className={styles.wizardSetupButtonWrapper}>
                            <Link href="/wizard-setup" className={styles.wizardSetupButton}>{t('Complete setup')}</Link>
                        </div>
                    )}
                    {expenses.map((expense) => (
                        <ExpensesGridItem
                            key={'grid_item_' + expense.id + '_' + expense.expense_amount_id}
                            expense={expense}
                            onAddExpensePayment={onAddExpensePayment}
                            showAll={showAll}
                        />
                    ))}
                </div>
                {!showAll && (
                    <div className={styles.expenseGridDetailedDetails}>
                        <ExpensesDetails
                            expenses={expenses}
                            expensesAmountByCurrency={expensesAmountByCurrency}
                            data={data}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpensesGridDetailed;
