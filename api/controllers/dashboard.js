const Payment = require("../models/payment");
const Currency = require("../models/currency");
const Utils = require("../utils/utils");
const ExpenseLibrary = require("../libraries/expense");
const Saving = require("../models/saving");
const User = require("../models/user");
const PaymentMethods = require("../models/paymentMethod");
const UserTime = require('../utils/userTime');

const getMonthlyTrend = async (userId, timezone, endOffset, currencies) => {
    const trend = {};
    const periods = [];
    for (let offset = endOffset + 5; offset >= endOffset; offset -= 1) {
        periods.push(UserTime.getPeriod(timezone, offset));
    }
    const results = await Promise.all(periods.map(async ({ month, year }) => {
        const previous = new Date(year, month - 2, 1);
        const payments = await Payment.getPayments(userId, month, year);
        return { month, year, data: await ExpenseLibrary.getExpensesExtended(userId, month, payments, currencies, year) };
    }));
    results.forEach(({ month, year, data }) => {
        const label = new Date(year, month - 1, 1).toLocaleDateString('en', { month: 'short' });
        Object.keys(data.totalAmountByCurrency).forEach((currencyId) => {
            if (!trend[currencyId]) trend[currencyId] = [];
            trend[currencyId].push({
                label,
                paid: data.amountPaidByCurrency[currencyId] || 0,
                pending: data.amountPendingByCurrency[currencyId] || 0,
            });
        });
    });
    return trend;
};

exports.get = async (req, res, next) => {
    try {
        var payments;
        var paymentsNextMonth;
        var currentMonth;
        var currencies;
        var lastMonth;
        var nextMonth;
        var monthText;
        var nextMonthText;
        var expensesNextMonth;
        var expensesExtended;
        var expensesNextMonthExtended;
        var year;
        const userId = req.user && req.user.id;
        if (userId) {
            const user = await User.getById(userId);
            const timezone = user.timezone || 'UTC';
            const monthOffset = Math.max(0, Math.min(Number(req.query.monthOffset) || 0, 11));
            const currentPeriod = UserTime.getPeriod(timezone, monthOffset);
            const nextPeriod = UserTime.getPeriod(timezone, monthOffset - 1);
            const previousPeriod = UserTime.getPeriod(timezone, monthOffset + 1);
            currentMonth = currentPeriod.month;
            lastMonth = previousPeriod.month;
            nextMonth = nextPeriod.month;
            monthText = Utils.getMonthText(currentMonth);
            nextMonthText = Utils.getMonthText(nextMonth);
            year = currentPeriod.year;
            payments = await Payment.getPayments(userId, currentMonth, year);
            paymentsNextMonth = await Payment.getPayments(userId, nextMonth, nextPeriod.year);
            currencies = await Currency.getCurrencies(userId);
            expensesExtended = await ExpenseLibrary.getExpensesExtended(userId, currentMonth, payments, currencies, year);
            expensesNextMonthExtended = await ExpenseLibrary.getExpensesExtended(userId, nextMonth, paymentsNextMonth, currencies, nextPeriod.year);
            expensesNextMonth = expensesNextMonthExtended.expenses;
            const currentExpenseIds = new Set(expensesExtended.expenses.map((expense) => expense.id));
            const upcomingExpenses = expensesNextMonth.filter((expense) => !currentExpenseIds.has(expense.id));
            const planningPeriods = await Promise.all([1, 2, 3].map(async (offset) => {
                const period = UserTime.getPeriod(timezone, -offset);
                const periodPayments = await Payment.getPayments(userId, period.month, period.year);
                const data = await ExpenseLibrary.getExpensesExtended(userId, period.month, periodPayments, currencies, period.year);
                return { ...period, label: Utils.getMonthText(period.month), expenses: data.expenses, totals: data.totalAmountByCurrency };
            }));
            const upcomingOneTimeExpenses = planningPeriods.flatMap((period) => period.expenses.filter((expense) => [1, 4].includes(Number(expense.type_id))).map((expense) => ({ ...expense, periodLabel: period.label }))).filter((expense, index, items) => items.findIndex((item) => item.id === expense.id && item.expense_amount_id === expense.expense_amount_id) === index);
            const scheduledExpensesAhead = planningPeriods.flatMap((period) => period.expenses.filter((expense) => Number(expense.type_id) === 2).map((expense) => ({ ...expense, periodLabel: period.label }))).filter((expense, index, items) => items.findIndex((item) => item.id === expense.id && item.expense_amount_id === expense.expense_amount_id) === index);
            const creditCardOutlook = Object.values(expensesExtended.expenses.reduce((cards, expense) => {
                if (!expense.payment_method_id) return cards;
                const key = expense.payment_method_id;
                if (!cards[key]) cards[key] = { id: key, name: expense.creditCardStatementName || expense.name, dueDateDay: expense.dueDateDay, amounts: {}, pendingPurchases: 0 };
                if (expense.is_credit_card_purchase && !expense.isFullPaid) cards[key].pendingPurchases += 1;
                if (!expense.is_credit_card_purchase) cards[key].amounts[expense.currency_id] = { symbol: expense.currency_symbol, amount: Number(expense.amount || 0), paid: Number(expense.paymentTotal || 0) };
                return cards;
            }, {}));
            const recurringExpenses = expensesExtended.expenses.filter((expense) => Number(expense.type_id) === 3 && !expense.is_credit_card_purchase);
            const recurringReview = Object.values(recurringExpenses.reduce((review, expense) => {
                const key = expense.currency_id;
                if (!review[key]) review[key] = { currencyId: key, symbol: expense.currency_symbol, amount: 0, count: 0 };
                review[key].amount += Number(expense.amount || 0);
                review[key].count += 1;
                return review;
            }, {}));
            const [monthlyTrend, savings, paymentMethods] = await Promise.all([
                getMonthlyTrend(userId, timezone, monthOffset, currencies),
                Saving.getGoals(userId),
                PaymentMethods.getPaymentMethods(userId),
            ]);
            expensesExtended.expenses.forEach((expense) => { expense.paymentMethods = paymentMethods; });
            expensesNextMonth.forEach((expense) => { expense.paymentMethods = paymentMethods; });
            payments = payments.slice(0, 10);
            expensesExtended.monthlyTrend = monthlyTrend;
            expensesExtended.savingsCount = savings.length;
            expensesExtended.dashboardShowNextMonth = user.dashboard_show_next_month !== false;
            expensesExtended.upcomingExpenses = upcomingExpenses;
            expensesExtended.upcomingOneTimeExpenses = upcomingOneTimeExpenses;
            expensesExtended.scheduledExpensesAhead = scheduledExpensesAhead;
            expensesExtended.creditCardOutlook = creditCardOutlook;
            expensesExtended.cashFlowForecast = planningPeriods.map((period) => ({ label: period.label, totals: Object.values(period.totals).map((total) => ({ symbol: total.currency?.symbol, amount: total.amount })) }));
            expensesExtended.recurringReview = recurringReview;
        }
        res.json({
            ...expensesExtended,
            payments,
            expensesNextMonth,
            upcomingExpenses: expensesExtended.upcomingExpenses,
            upcomingOneTimeExpenses: expensesExtended.upcomingOneTimeExpenses,
            scheduledExpensesAhead: expensesExtended.scheduledExpensesAhead,
            creditCardOutlook: expensesExtended.creditCardOutlook,
            cashFlowForecast: expensesExtended.cashFlowForecast,
            recurringReview: expensesExtended.recurringReview,
            monthText,
            nextMonthText
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching savings.' });
    }
};

exports.getNavigationSummary = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.json({ pendingCount: 0 });
        const user = await User.getById(userId);
        const timezone = user.timezone || 'UTC';
        const { month, year } = UserTime.getCurrentPeriod(timezone);
        const currencies = await Currency.getCurrencies(userId);
        const payments = await Payment.getPayments(userId, month, year);
        const data = await ExpenseLibrary.getExpensesExtended(userId, month, payments, currencies, year);
        const pendingCount = data.expenses.filter((expense) => !expense.isFullPaid && Number(expense.paymentTotal || 0) < Number(expense.amount || 0)).length;
        return res.json({ pendingCount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while fetching navigation data.' });
    }
};
