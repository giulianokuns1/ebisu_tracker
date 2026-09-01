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
        }
        res.json({
            ...expensesExtended,
            payments,
            expensesNextMonth,
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
