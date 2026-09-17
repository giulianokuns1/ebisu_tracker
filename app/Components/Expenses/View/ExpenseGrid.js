import styles from '@/Components/Expenses/Expenses.module.scss';
import React from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import ExpensesGridItem from "@/Components/Expenses/View/ExpenseGridItem";
import Link from 'next/link';

const ExpensesGrid = ({ expenses, upcomingExpenses = [], monthText, nextMonthText, onAddExpensePayment, monthEdits, setMonthEdits, onSaveMonthEdits, aside, onManageCategoryOrder }) => {
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
            const key = expense.is_credit_card_purchase ? `expense-${expense.id}-${expense.expense_amount_id}` : `expense-${expense.id}`;
            const group = groups.get(key) || { ...expense, currencyAmounts: [] };
            if (!expense.is_credit_card_purchase) Object.assign(group, expense);
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
    const isPaid = (expense) => (expense.currencyAmounts || [expense]).every((amount) => Number(amount.amount || 0) === 0 || Number(amount.paymentTotal || 0) >= Number(amount.amount || 0));
    const groupedByCategory = (items) => Object.values(items.reduce((groups, expense) => {
        const id = expense.category_id || 'other';
        if (!groups[id]) groups[id] = { id, name: expense.category_name || t('Other'), icon: expense.category_icon || 'bi bi-three-dots', color: expense.category_color || '#809297', position: expense.category_position, expenses: [] };
        groups[id].expenses.push(expense);
        return groups;
    }, {})).sort((a, b) => (Number.isFinite(Number(a.position)) ? Number(a.position) : Number.MAX_SAFE_INTEGER) - (Number.isFinite(Number(b.position)) ? Number(b.position) : Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name));
    const renderCategoryGroups = (items, label, tone) => items.length ? <section className={styles.expenseStatusGroup}><h2 className={styles[`expense${tone}Heading`]}>{label}</h2>{groupedByCategory(items).map((category) => <div className={styles.expenseCategoryGroup} key={category.id}><h3><span style={{ color: category.color, backgroundColor: `${category.color}22` }}><i className={category.icon} aria-hidden="true" /></span>{t(category.name)}</h3>{category.expenses.sort((a, b) => a.name.localeCompare(b.name)).map((expense) => <ExpensesGridItem key={`grid_item_${expense.id}_${expense.expense_amount_id}`} expense={expense} onAddExpensePayment={onAddExpensePayment} monthEdits={monthEdits} setMonthEdits={setMonthEdits} />)}</div>)}</section> : null;
    const groupedExpenses = groupCreditExpenses(expenses);
    const pendingExpenses = groupedExpenses.filter((expense) => !isPaid(expense));
    const paidExpenses = groupedExpenses.filter(isPaid);

    return (
        <div>
            <div className={styles.expenseGridContainer}>
                <div className={`${styles.dashboardExpensePanel} ${styles.currentExpensePanel}`}>
                    <div className={styles.expenseGridContainerMonthText}>
                        <span>{t(monthText)}</span><span>{Object.keys(monthEdits || {}).length > 0 && <button type="button" className={styles.updateMonthButton} onClick={onSaveMonthEdits}>{t('Update Month')}</button>}<button type="button" className={styles.categoryOrderButton} onClick={onManageCategoryOrder} aria-label={t('Category order')}><i className="bi bi-gear" aria-hidden="true" /></button><Link href="/expenses">{t('View All')}</Link></span>
                    </div>
                    {renderCategoryGroups(pendingExpenses, t('Pending Expenses'), 'Pending')}
                    {renderCategoryGroups(paidExpenses, t('Paid Expenses'), 'Paid')}
                    {renderTotal(expenses)}
                </div>
                <div className={styles.expenseSidebar}>
                    <div className={`${styles.dashboardExpensePanel} ${styles.upcomingExpensePanel}`}>
                        <div className={styles.expenseGridContainerMonthText}>
                            <span><i className="bi bi-calendar-plus" aria-hidden="true" /><span>{t('Coming in')} {t(nextMonthText)}<small>{t('New expenses not in')} {t(monthText)}</small></span></span><Link href="/expenses">{t('View All')}</Link>
                        </div>
                        {upcomingExpenses.length ? upcomingExpenses.map((expense) => <div className={styles.upcomingExpenseRow} key={`upcoming_${expense.id}_${expense.expense_amount_id}`}><span className={styles.expenseCategoryIcon} style={{ color: expense.category_color || '#809297', backgroundColor: `${expense.category_color || '#809297'}22` }}><i className={expense.category_icon || 'bi bi-receipt'} aria-hidden="true" /></span><span><strong>{t(expense.name)}</strong><small>{t(expense.formattedGridDueDate)}</small></span><b>{expense.currency_symbol} {Number(expense.amount || 0).toFixed(2)}</b></div>) : <div className={styles.upcomingEmpty}><i className="bi bi-calendar-check" aria-hidden="true" />{t('No new expenses next month.')}</div>}
                    </div>
                    {aside}
                </div>
            </div>
        </div>
    );
};

export default ExpensesGrid;
