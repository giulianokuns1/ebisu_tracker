const Payment = require('../models/payment');
const Expense = require("../models/expense");
const PaymentMethods = require("../models/paymentMethod");
const PaymentLibrary = require("../libraries/payment");
const ExpenseAmountSchedule = require("../models/expenseAmountSchedule");
const moment = require('moment');

exports.getPayments = async (req, res, next) => {
    try {
        let payments;
        const userId = req.user && req.user.id;
        const month = req.query && req.query.m;
        const year = req.query && req.query.y;
        if (userId) {
            payments = await Payment.getPayments(userId, month, year);
        }
        res.json({ payments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching payments.' });
    }
};
exports.createExpensePayment = async (req, res, next) => {
    try {
        let payment;
        let originalAmount;
        let date;
        const userId = req.user && req.user.id;
        const { expense, amount, comment, paymentMethod, paymentDate, isFullPaid } = req.body;
        if (userId && expense && amount && paymentMethod && paymentDate) {
            date = moment(paymentDate).format('YYYY-MM-DD HH:mm:ss');
            originalAmount = expense && expense.amount;
            payment = await PaymentLibrary.createPayment(userId, expense.expense_amount_id, paymentMethod, amount, comment, originalAmount, expense, date, isFullPaid);
            payment = payment && payment[0];
        }
        res.json({ payment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating payments.' });
    }
};
exports.getPayment = async (req, res, next) => {
    try {
        let payment;
        let expenses;
        let paymentMethods;
        const userId = req.user && req.user.id;
        const paymentId = req.query && req.query.paymentId;
        const currentMonth = moment().month() + 1;
        if (userId && paymentId) {
            payment = await Payment.getPayment(userId, paymentId);
            payment = payment && payment[0];
            expenses = await Expense.getExpenses(userId);
            // Apply scheduled amounts to expense_amounts for current month
            expenses = await Promise.all(expenses.map(async (expense) => {
                if (expense.expense_amounts && expense.expense_amounts.length > 0) {
                    expense.expense_amounts = await Promise.all(expense.expense_amounts.map(async (expenseAmount) => {
                        const expenseAmountSchedule = await ExpenseAmountSchedule.getByMonth(expenseAmount.id, currentMonth);
                        if (expenseAmountSchedule.length > 0) {
                            expenseAmount.amount = expenseAmountSchedule[0].amount;
                        }
                        return expenseAmount;
                    }));
                }
                return expense;
            }));
            paymentMethods = await PaymentMethods.getPaymentMethods(userId);
        }
        res.json({ payment, expenses, paymentMethods });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching payment.' });
    }
};
exports.newPaymentData = async (req, res, next) => {
    try {
        let expenses;
        let paymentMethods;
        const userId = req.user && req.user.id;
        const currentMonth = moment().month() + 1;
        if (userId) {
            expenses = await Expense.getExpenses(userId);
            // Apply scheduled amounts to expense_amounts for current month
            expenses = await Promise.all(expenses.map(async (expense) => {
                if (expense.expense_amounts && expense.expense_amounts.length > 0) {
                    expense.expense_amounts = await Promise.all(expense.expense_amounts.map(async (expenseAmount) => {
                        const expenseAmountSchedule = await ExpenseAmountSchedule.getByMonth(expenseAmount.id, currentMonth);
                        if (expenseAmountSchedule.length > 0) {
                            expenseAmount.amount = expenseAmountSchedule[0].amount;
                        }
                        return expenseAmount;
                    }));
                }
                return expense;
            }));
            paymentMethods = await PaymentMethods.getPaymentMethods(userId);
        }
        res.json({
            expenses,
            paymentMethods,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
};
exports.newPayment = async (req, res, next) => {
    let expense;
    let originalAmount;
    let payment;
    let paymentId;
    let date;
    try {
        const { id, amount, comment, expenseId, paymentMethod, expenseAmountId, paymentDate } = req.body;
        const userId = req.user && req.user.id;
        if (userId) {
            if (expenseId) {
                expense = await Expense.getExpense(userId, expenseId);
                expense = expense && expense[0];
                originalAmount = expense && expense.original_amount;
            }
            date = moment(paymentDate).format('YYYY-MM-DD HH:mm:ss');
            if (id) {
                payment = await Payment.updatePayment(id, userId, expenseAmountId, paymentMethod, amount, comment, originalAmount, date);
            } else {
                payment = await PaymentLibrary.createPayment(userId, expenseAmountId, paymentMethod, amount, comment, originalAmount, expense, date);
            }
            paymentId = payment && payment.length && payment[0];
        }
        res.json({ paymentId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error creating the payment.' });
    }
};
exports.deletePayment = async (req, res, next) => {
    try {
        const { id } = req.body;
        const userId = req.user && req.user.id;
        if (userId && id) {
            await Payment.deletePayment(id, userId);
        }
        res.status(200).json({ message: 'Delete successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error creating the payment.' });
    }
};
