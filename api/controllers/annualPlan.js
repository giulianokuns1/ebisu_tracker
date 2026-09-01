const knex = require('knex')(require('../knexfile'));
const User = require('../models/user');
const UserTime = require('../utils/userTime');

const isScheduledForMonth = (expense, scheduledMonths, year, month) => {
    const type = Number(expense.type_id);
    if (type === 3) return true;
    if (type === 2) return scheduledMonths.has(month);
    if (!expense.due_date) return false;
    const dueDate = new Date(expense.due_date);
    if (type === 4) return dueDate.getMonth() + 1 === month;
    return dueDate.getFullYear() === year && dueDate.getMonth() + 1 === month;
};

exports.get = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(400).json({ error: 'Invalid year.' });
        const user = await User.getById(userId);
        const timezone = user.timezone || 'UTC';
        const year = Number(req.query.year) || UserTime.getCurrentPeriod(timezone).year;
        if (!Number.isInteger(year)) return res.status(400).json({ error: 'Invalid year.' });

        const [expenseRows, schedules, overrides, payments, income, paymentMethods] = await Promise.all([
            knex('expenses')
                .select('expenses.id as expense_id', 'expenses.name', 'expenses.type_id', 'expenses.due_date', 'expenses.category_id', 'expenses.payment_method_id', 'expenses.is_credit_card_purchase', 'categories.name as category_name', 'categories.color as category_color', 'expense_amounts.id as expense_amount_id', 'expense_amounts.amount as base_amount', 'currencies.id as currency_id', 'currencies.name as currency_name', 'currencies.symbol as currency_symbol')
                .where('expenses.user_id', userId)
                .where('expenses.inactive', false)
                .join('expense_amounts', 'expenses.id', 'expense_amounts.expense_id')
                .join('currencies', 'expense_amounts.currency_id', 'currencies.id')
                .leftJoin('categories', 'expenses.category_id', 'categories.id')
                .orderByRaw('categories.position IS NULL')
                .orderBy('categories.position')
                .orderByRaw('COALESCE(categories.name, \'Other\')')
                .orderBy('expenses.name'),
            knex('expense_schedule')
                .select('expense_id', 'month')
                .join('expenses', 'expense_schedule.expense_id', 'expenses.id')
                .where('expenses.user_id', userId),
            knex('expense_amount_schedule')
                .select('expense_amount_id', 'month', 'amount')
                .where('user_id', userId)
                .where('year', year),
            knex('payments')
                .select('expense_amount_id', 'amount', 'created_at')
                .where('user_id', userId)
                .whereRaw('YEAR(created_at) = ?', [year]),
            knex('income_transactions')
                .select('currency_id', 'amount', 'received_at')
                .where('user_id', userId)
                .whereRaw('YEAR(received_at) = ?', [year]),
            knex('payment_methods')
                .select('id', 'name', 'is_default')
                .where('user_id', userId)
                .orderBy('is_default', 'desc')
                .orderBy('name'),
        ]);

        const monthsByExpense = new Map();
        schedules.forEach((item) => {
            const months = monthsByExpense.get(item.expense_id) || new Set();
            months.add(Number(item.month));
            monthsByExpense.set(item.expense_id, months);
        });
        const overridesByAmount = new Map();
        overrides.forEach((item) => overridesByAmount.set(`${item.expense_amount_id}:${item.month}`, Number(item.amount)));
        const paidByAmountMonth = new Map();
        payments.forEach((item) => {
            const month = UserTime.getMonthFromDate(item.created_at, timezone);
            const key = `${item.expense_amount_id}:${month}`;
            paidByAmountMonth.set(key, (paidByAmountMonth.get(key) || 0) + Number(item.amount));
        });
        const incomeByCurrencyMonth = new Map();
        income.forEach((item) => {
            const month = UserTime.getMonthFromDate(item.received_at, timezone);
            const key = `${item.currency_id}:${month}`;
            incomeByCurrencyMonth.set(key, (incomeByCurrencyMonth.get(key) || 0) + Number(item.amount));
        });

        const expenses = expenseRows.map((expense) => {
            const cells = Array.from({ length: 12 }, (_, index) => {
                const month = index + 1;
                const hasPlan = isScheduledForMonth(expense, monthsByExpense.get(expense.expense_id) || new Set(), year, month);
                const planned = hasPlan ? (overridesByAmount.get(`${expense.expense_amount_id}:${month}`) ?? Number(expense.base_amount)) : 0;
                const paid = expense.is_credit_card_purchase ? planned : paidByAmountMonth.get(`${expense.expense_amount_id}:${month}`) || 0;
                return { month, hasPlan, planned, paid, remaining: Math.max(planned - paid, 0) };
            });
            let carryOver = 0;
            cells.forEach((cell) => {
                cell.carryOver = carryOver;
                carryOver += cell.remaining;
            });
            return { ...expense, cells };
        });

        const categories = [...new Map(expenseRows.filter((item) => item.category_name).map((item) => [item.category_id, { id: item.category_id, name: item.category_name, color: item.category_color }])).values()];
        const currencies = [...new Map(expenseRows.map((item) => [item.currency_id, { id: item.currency_id, name: item.currency_name, symbol: item.currency_symbol }])).values()];
        const totals = currencies.map((currency) => {
            const monthly = Array.from({ length: 12 }, (_, index) => {
                const month = index + 1;
                const rows = expenses.filter((item) => item.currency_id === currency.id && !item.is_credit_card_purchase).map((item) => item.cells[index]);
                const planned = rows.reduce((sum, item) => sum + item.planned, 0);
                const paid = rows.reduce((sum, item) => sum + item.paid, 0);
                const remaining = rows.reduce((sum, item) => sum + item.remaining, 0);
                const carryOver = rows.reduce((sum, item) => sum + item.carryOver, 0);
                const incomeAmount = incomeByCurrencyMonth.get(`${currency.id}:${month}`) || 0;
                return { month, income: incomeAmount, planned, paid, remaining, carryOver, availableAfterPlanned: incomeAmount - planned, availableAfterPaid: incomeAmount - paid };
            });
            return { ...currency, monthly };
        });

        return res.json({ year, expenses, totals, paymentMethods, categories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while building the annual plan.' });
    }
};
