const Expense = require('../models/expense');
const Category = require('../models/category');
const ExpensesType = require('../models/expenseType');
const Currency = require('../models/currency');
const Payment = require('../models/payment');
const PaymentMethod = require('../models/paymentMethod');
const PaymentMethods = require('../models/paymentMethod');
const Utils = require('../utils/utils');
const ExpenseLibrary = require('../libraries/expense');
const ExpenseSchedule = require('../models/expenseSchedule');
const ExpenseAmountSchedule = require('../models/expenseAmountSchedule');
const PaymentLibrary = require('../libraries/payment');
const User = require('../models/user');
const UserTime = require('../utils/userTime');
const moment = require("moment");

exports.getExpenses = async (req, res, next) => {
    try {
        let lastMonth;
        let monthText;
        let payments;
        let currencies;
        let userId = req.user && req.user.id;
        let expensesExtended;
        let showAll = req.query && req.query.showAll;
        const user = await User.getById(userId);
        const { month: currentMonth, year: currentYear } = UserTime.getCurrentPeriod(user.timezone);
        let month = parseInt((req.query && req.query.m), 10) || currentMonth;
        monthText = Utils.getMonthText(month);
        if (userId) {
            lastMonth = month - 1;
            currencies = await Currency.getCurrencies(userId);
            payments = await Payment.getPayments(userId, showAll ? null : month, showAll ? null : currentYear);
            expensesExtended = await ExpenseLibrary.getExpensesExtended(userId, month, payments, currencies, currentYear, showAll);
            const categorySummaryByCurrency = {};
            expensesExtended.expenses.forEach((expense) => {
                const currencyId = expense.currency_id;
                if (!categorySummaryByCurrency[currencyId]) categorySummaryByCurrency[currencyId] = [];
                let category = categorySummaryByCurrency[currencyId].find((item) => item.id === expense.category_id);
                if (!category) {
                    category = {
                        id: expense.category_id || 'other',
                        name: expense.category_name || 'Other',
                        icon: expense.category_icon || 'bi bi-three-dots',
                        color: expense.category_color || '#4FD6BE',
                        amount: 0,
                        count: 0,
                        currency_symbol: expense.currency_symbol,
                    };
                    categorySummaryByCurrency[currencyId].push(category);
                }
                category.amount += Number(expense.amount) || 0;
                category.count += 1;
            });
            Object.values(categorySummaryByCurrency).forEach((categories) => categories.sort((a, b) => b.amount - a.amount));
            expensesExtended.categorySummaryByCurrency = categorySummaryByCurrency;
            expensesExtended.totalEntries = expensesExtended.expenses.length;
            expensesExtended.daysInMonth = new Date(currentYear, month, 0).getDate();
        }
        res.json({
            ...expensesExtended,
            payments,
            monthText
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching expenses.' });
    }
};
exports.getExpense = async (req, res, next) => {
    try {
        let expense;
        let expenseAmounts;
        let categories;
        let expensesTypes;
        let currencies;
        let expenseSchedule;
        let expenseAmountSchedule;
        let payments;
        let creditPaymentMethods;
        let userId = req.user && req.user.id;
        let expenseId = req.query && req.query.expenseId;
        if (userId && expenseId) {
            expense = await Expense.getExpense(userId, expenseId);
            expense = expense && expense[0];
            const user = await User.getById(userId);
            const scheduleYear = Number(req.query && req.query.scheduleYear) || UserTime.getCurrentPeriod(user.timezone).year;
            expenseAmounts = await ExpenseLibrary.getExpenseAmountByExpense(userId, expenseId, scheduleYear);
            categories = await Category.getCategories(userId);
            expensesTypes = await ExpensesType.getExpensesType();
            currencies = await Currency.getCurrencies(userId);
            creditPaymentMethods = await PaymentMethod.getCreditPaymentMethods(userId);
            expenseSchedule = await ExpenseSchedule.get(expenseId);
            expenseAmountSchedule = await Promise.all(expenseAmounts.map((amount) => ExpenseAmountSchedule.get(amount.id, scheduleYear)));
            payments = await PaymentLibrary.getPaymentsByExpense(userId, expenseId);
        }
        res.json({
            categories,
            expensesTypes,
            currencies,
            expense,
            expenseAmounts,
            expenseSchedule,
            expenseAmountSchedule: expenseAmountSchedule.flat(),
            payments: payments.payments,
            paymentsByMonth: payments.monthPayments,
            creditPaymentMethods,
            totalPaid: payments.totalPaid
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching expenses.' });
    }
};
exports.newExpenseData = async (req, res, next) => {
    try {
        let categories;
        let expensesTypes;
        let currencies;
        let creditPaymentMethods;
        let userId = req.user && req.user.id;
        if (userId) {
            categories = await Category.getCategories(userId);
            expensesTypes = await ExpensesType.getExpensesType();
            currencies = await Currency.getCurrencies(userId);
            creditPaymentMethods = await PaymentMethod.getCreditPaymentMethods(userId);
        }
        res.json({
            categories,
            expensesTypes,
            currencies,
            creditPaymentMethods
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching expenses.' });
    }
};
exports.createUpdateExpense = async (req, res, next) => {
    try {
        let data;
        let expenseId;
        const { id, name, category, expenseType, expenseDueDate, expenseAmounts, expenseDueDay, scheduledMonths, amountSchedule, paymentMethodId } = req.body;
        const userId = req.user && req.user.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const paymentMethod = paymentMethodId ? (await PaymentMethod.getPaymentMethod(userId, paymentMethodId))[0] : null;
        if (paymentMethodId && (!paymentMethod || !paymentMethod.is_credit || (Number(paymentMethod.expense_id) === Number(id) && Number(paymentMethod.id) !== Number(paymentMethodId)))) {
            return res.status(400).json({ error: 'Invalid credit card payment method.' });
        }
        data = {
            id: id,
            name: name,
            category: category,
            expenseType: expenseType,
            expenseDueDate: expenseDueDate ? moment(expenseDueDate).format('YYYY-MM-DD') : null,
            expenseAmounts: expenseAmounts,
            expenseDueDay: expenseDueDay,
            scheduledMonths: scheduledMonths,
            amountSchedule: amountSchedule,
            paymentMethodId: paymentMethodId === undefined ? undefined : paymentMethod ? paymentMethod.id : null,
            paymentMethodExpenseId: paymentMethod?.expense_id || null
        }
        expenseId = await ExpenseLibrary.createUpdateExpense(userId, data);
        res.json({ expenseId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error creating the expense.' });
    }
};
exports.deleteExpense = async (req, res, next) => {
    try {
        const { id } = req.body;
        const userId = req.user && req.user.id;
        if (userId && id) {
            await Expense.update(id, userId, { inactive: true });
        }
        res.status(200).json({ message: 'Delete successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error deleting the expense.' });
    }
};
exports.deleteExpenseAmount = async (req, res, next) => {
    try {
        const { id } = req.body;
        const userId = req.user && req.user.id;
        if (userId && id) {
            await Payment.deletePaymentsByExpenseAmount(userId, id);
            await Expense.deleteExpenseAmount(id);
        }
        res.status(200).json({ message: 'Delete successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error deleting the expense amount.' });
    }
};
exports.updateMonthAmounts = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const { expenseId, year, month, amounts } = req.body;
        const scheduleYear = Number(year);
        const scheduleMonth = Number(month);
        if (!userId || !Number(expenseId) || !Number.isInteger(scheduleYear) || !Number.isInteger(scheduleMonth) || scheduleMonth < 1 || scheduleMonth > 12 || !Array.isArray(amounts)) {
            return res.status(400).json({ error: 'Invalid monthly amount update.' });
        }

        const expense = await Expense.getExpense(userId, expenseId);
        if (!expense.length || ![2, 3].includes(Number(expense[0].type_id))) {
            return res.status(400).json({ error: 'This expense does not support a monthly plan.' });
        }

        const scheduledMonths = await ExpenseSchedule.get(expenseId);
        if (Number(expense[0].type_id) === 2 && !scheduledMonths.some((item) => Number(item.month) === scheduleMonth)) {
            return res.status(400).json({ error: 'This expense is not scheduled for the selected month.' });
        }

        const expenseAmounts = await Expense.getExpenseAmount(userId, expenseId);
        const ownedAmountIds = new Set(expenseAmounts.map((item) => Number(item.id)));
        for (const item of amounts) {
            const amountId = Number(item.expenseAmountId);
            const amount = Number(item.amount);
            if (!ownedAmountIds.has(amountId) || !Number.isFinite(amount) || amount < 0) {
                return res.status(400).json({ error: 'Invalid monthly amount.' });
            }
            await ExpenseAmountSchedule.upsert(userId, amountId, scheduleYear, scheduleMonth, amount);
        }

        return res.status(200).json({ message: 'Monthly amounts updated.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while updating monthly amounts.' });
    }
};
exports.getPendingExpenses = async (req, res, next) => {
    try {
        let expenses;
        let pendingExpenses = [];
        let paidExpenses = [];
        let expensesIds = [];
        let paymentMethods = [];
        const userId = req.user && req.user.id;
        if (userId) {
            const user = await User.getById(userId);
            const { month, year } = UserTime.getCurrentPeriod(user.timezone);
            const currencies = await Currency.getCurrencies(userId);
            const monthlyPayments = await Payment.getPayments(userId, month, year);
            const monthlyExpenses = await ExpenseLibrary.getExpensesExtended(userId, month, monthlyPayments, currencies, year);
            expenses = monthlyExpenses.expenses.reduce((grouped, expense) => {
                if (!grouped[expense.id]) grouped[expense.id] = { ...expense, expense_amounts: [] };
                grouped[expense.id].expense_amounts.push(expense);
                return grouped;
            }, {});
            expenses = Object.values(expenses);
            paymentMethods = await PaymentMethods.getPaymentMethods(userId);
            expenses = await Promise.all(expenses.map(async (expense) => {
                expense.formattedDueDate = Utils.expenseFormattedDueDate(expense);
                expense.isTotalPaid = expense.expense_amounts.every((expenseAmount) => Boolean(expenseAmount.isFullPaid) || Number(expenseAmount.paymentTotal || 0) >= Number(expenseAmount.amount || 0));

                if (expense.is_credit_card_purchase) return expense;
                if (expense.isTotalPaid) {
                    paidExpenses.push(expense);
                } else if (!expense.isTotalPaid) {
                    pendingExpenses.push(expense);
                }
                expense.paymentMethods = paymentMethods;
                return expense;
            }));
        }
        res.json({ expenses, paidExpenses, pendingExpenses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching expenses.' });
    }
};
