import styles from '@/Components/Expenses/Expenses.module.scss';
import React from "react";
import { useTranslation } from '@/Hooks/useTranslation';
import ExpensesPayment from "@/Components/Expenses/ExpensePayment";
import { useRouter } from "next/router";

const ExpensesList = ({ expenses }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const handleEditExpense = (expenseId) => {
        router.push('/expenses/details/' + expenseId);
    }
    const onAddExpensePayment = () => {}
    return (
        <div>
            <div className={styles.expenseListContainer}>
                {expenses.map((expense) => (
                    <div key={expense.id} className={styles.expenseCard}>
                        <div className={styles.categoryContainer}>
                            <div className={styles.categoryIconContainer}>
                                <i className={`${expense.category_icon} ${styles.categoryIcon}`}></i>
                            </div>
                            <div className={styles.categoryName}>{expense.category_name}</div>
                        </div>
                        <div className={styles.mainCardContainer} onClick={() => handleEditExpense(expense.id)}>
                            <div className={styles.name}>{t(expense.name)}</div>
                            <div className={styles.dateFrecuencyContainer}>
                                <div className={styles.dateFrecuency}>{t(expense.formattedDueDate)} - {t(expense.expenses_type_name)}</div>
                            </div>
                            <div className={styles.amountContainer}>
                                {expense.expense_amounts && expense.expense_amounts.map((expenseAmount) => (
                                    <div key={expenseAmount.id} className={styles.amount}>
                                        {expenseAmount.currency_symbol} {expenseAmount.amount}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <ExpensesPayment expense={expense} onAddExpensePayment={onAddExpensePayment}/>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpensesList;
