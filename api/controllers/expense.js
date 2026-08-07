const Expense = require('../models/expense');
const Category = require('../models/category');
const ExpensesType = require('../models/expenseType');
const Currency = require('../models/currency');
const Payment = require('../models/payment');
const PaymentMethods = require('../models/paymentMethod');
const Utils = require('../utils/utils');
const ExpenseLibrary = require('../libraries/expense');
const ExpenseSchedule = require('../models/expenseSchedule');
const PaymentLibrary = require('../libraries/payment');
const moment = require("moment");

exports.getExpenses = async (req, res, next) => {
    try {
        let lastMonth;
        let monthText;
        let payments;
        let creditPayments;
        let currencies;
        let currentMonth = new Date().getMonth() + 1;
        let currentYear = new Date().getFullYear();
        let userId = req.user && req.user.id;
        let month = parseInt((req.query && req.query.m), 10) || currentMonth;
        let expensesExtended;
        let showAll = req.query && req.query.showAll;
        monthText = Utils.getMonthText(month);
        if (userId) {
            lastMonth = month - 1;
            currencies = await Currency.getCurrencies(userId);
            payments = await Payment.getPayments(userId, showAll ? null : month, showAll ? null : currentYear);
            creditPayments = await Payment.getCreditPayments(userId, showAll ? null : lastMonth, showAll ? null : currentYear);
            expensesExtended = await ExpenseLibrary.getExpensesExtended(userId, month, payments, creditPayments, currencies, showAll);
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
            creditPayments,
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
        let payments;
        let userId = req.user && req.user.id;
        let expenseId = req.query && req.query.expenseId;
        if (userId && expenseId) {
            expense = await Expense.getExpense(userId, expenseId);
            expense = expense && expense[0];
            expenseAmounts = await ExpenseLibrary.getExpenseAmountByExpense(userId, expenseId);
            categories = await Category.getCategories(userId);
            expensesTypes = await ExpensesType.getExpensesType();
            currencies = await Currency.getCurrencies(userId);
            expenseSchedule = await ExpenseSchedule.get(expenseId);
            payments = await PaymentLibrary.getPaymentsByExpense(userId, expenseId);
        }
        res.json({
            categories,
            expensesTypes,
            currencies,
            expense,
            expenseAmounts,
            expenseSchedule,
            payments: payments.payments,
            paymentsByMonth: payments.monthPayments,
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
        let userId = req.user && req.user.id;
        if (userId) {
            categories = await Category.getCategories(userId);
            expensesTypes = await ExpensesType.getExpensesType();
            currencies = await Currency.getCurrencies(userId);
        }
        res.json({
            categories,
            expensesTypes,
            currencies
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
        const { id, name, category, expenseType, expenseDueDate, expenseAmounts, expenseDueDay, scheduledMonths, expensePaymentMethod } = req.body;
        const userId = req.user && req.user.id;
        data = {
            id: id,
            name: name,
            category: category,
            expenseType: expenseType,
            expenseDueDate: expenseDueDate ? moment(expenseDueDate).format('YYYY-MM-DD') : null,
            expenseAmounts: expenseAmounts,
            expenseDueDay: expenseDueDay,
            scheduledMonths: scheduledMonths,
            expensePaymentMethod: expensePaymentMethod
        }
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
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
exports.getPendingExpenses = async (req, res, next) => {
    try {
        let expenses;
        let pendingExpenses = [];
        let paidExpenses = [];
        let payments;
        let expensesIds = [];
        let paymentMethods = [];
        let creditPayments;
        const userId = req.user && req.user.id;
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        if (userId) {
            expenses = await Expense.getExpenses(userId, month, year);
            expensesIds = expenses.map((expense) => expense.id);
            paymentMethods = await PaymentMethods.getPaymentMethods(userId);
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentMonthRange = Utils.getMonthMonthRange(currentMonth + 1);
            payments = await Payment.getExpensesPayments(userId, expensesIds, year, currentMonthRange);
            expenses = await Promise.all(expenses.map(async (expense) => {
                expense.formattedDueDate = Utils.expenseFormattedDueDate(expense);
                expense.isTotalPaid = true;
                if (expense && expense.payment_method_id) {
                    creditPayments = await ExpenseLibrary.getCreditExpenses(userId, month, year, paymentMethods, expense);
                    expense.expense_amounts.map(async (expenseAmount) => {
                        expenseAmount.payments = [];
                        expenseAmount.paymentTotal = 0;
                        expenseAmount.amount = 0;
                        creditPayments.map((payment) => {
                            if (payment.expense_amount_currency_id === expenseAmount.currency_id &&
                                payment.payment_method_id === expense.payment_method_id) {
                                expenseAmount.amount += parseFloat(payment.amount);
                            }
                        });
                        payments.map((payment) => {
                            if (payment.expense_amount_currency_id === expenseAmount.currency_id &&
                                expense.payment_method_id &&
                                payment.is_credit_payment &&
                                payment.expense_amount_id === expenseAmount.id
                            ) {
                                expenseAmount.payments.push(payment);
                                expenseAmount.paymentTotal += parseFloat(payment.amount);
                            }
                        });
                        expenseAmount.isPaid = expenseAmount.paymentTotal >= expenseAmount.amount;
                        if (!expenseAmount.isPaid) {
                            expense.isTotalPaid = false;
                        }
                    });
                } else {
                    expense.expense_amounts.map((expenseAmount) => {
                        expenseAmount.payments = [];
                        expenseAmount.paymentTotal = 0;
                        payments.map((payment) => {
                            if (payment.expense_amount_id === expenseAmount.id) {
                                expenseAmount.payments.push(payment);
                                expenseAmount.paymentTotal += Number(payment.amount) || 0;
                            }
                        });
                        expenseAmount.isPaid = expenseAmount.paymentTotal >= expenseAmount.amount;
                        if (!expenseAmount.isPaid) {
                            expense.isTotalPaid = false;
                        }
                    });
                }

                if (expense.isTotalPaid) {
                    paidExpenses.push(expense);
                } else {
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
