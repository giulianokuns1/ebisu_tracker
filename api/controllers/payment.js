const Payment = require('../models/payment');
const Expense = require("../models/expense");
const PaymentMethods = require("../models/paymentMethod");
const PaymentLibrary = require("../libraries/payment");
const ExpenseAmountSchedule = require("../models/expenseAmountSchedule");
const User = require("../models/user");
const UserTime = require('../utils/userTime');
const moment = require('moment');
const knex = require('knex')(require('../knexfile'));
const CreditPaymentAllocation = require('../models/creditPaymentAllocation');

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
        const { expense, amount, amounts, comment, paymentMethod, paymentDate, isFullPaid, allocations = [] } = req.body;
        const paymentLines = Array.isArray(amounts) ? amounts : [{ expenseAmountId: expense?.expense_amount_id, amount, originalAmount: expense?.amount, isFullPaid }];
        if (userId && expense && paymentLines.length && paymentMethod && paymentDate) {
            date = moment(paymentDate).format('YYYY-MM-DD HH:mm:ss');
            const user = await User.getById(userId);
            const { month: currentMonth, year: currentYear } = UserTime.getCurrentPeriod(user.timezone);
            payment = [];
            for (const line of paymentLines.filter((line) => Number(line.amount) > 0)) {
                const originalAmount = line.originalAmount ?? expense.amount;
                const paymentId = await knex.transaction(async (trx) => {
                    const createdPayment = await Payment.createPayment(userId, line.expenseAmountId, paymentMethod, line.amount, comment, originalAmount, Boolean(expense.payment_method_id), date, Boolean(line.isFullPaid), trx);
                    const paymentId = Array.isArray(createdPayment) ? createdPayment[0] : createdPayment;
                    const lineAllocations = allocations.filter((allocation) => Number(allocation.statementExpenseAmountId) === Number(line.expenseAmountId) && Number(allocation.amount) > 0);
                    const allocationTotal = lineAllocations.reduce((total, allocation) => total + Number(allocation.amount), 0);
                    if (allocationTotal > Number(line.amount) + 0.001) throw new Error('Credit allocations exceed the statement payment amount.');
                    if (lineAllocations.length && (!expense.payment_method_id || expense.is_credit_card_purchase)) throw new Error('Credit allocations can only be added to card statement payments.');
                    if (lineAllocations.length) {
                        const allocatedAmounts = await trx('expense_amounts as expense_amounts')
                            .select('expense_amounts.id', 'expense_amounts.amount')
                            .whereIn('expense_amounts.id', lineAllocations.map((allocation) => allocation.expenseAmountId))
                            .leftJoin('expenses', 'expenses.id', 'expense_amounts.expense_id')
                            .where({ 'expenses.user_id': userId, 'expenses.payment_method_id': expense.payment_method_id, 'expenses.is_credit_card_purchase': 1 });
                        if (allocatedAmounts.length !== lineAllocations.length) throw new Error('Invalid credit purchase allocation.');
                        const allocationIds = [...new Set(lineAllocations.map((allocation) => Number(allocation.expenseAmountId)))].sort((a, b) => a - b);
                        const existingAllocations = await trx('credit_payment_allocations').select('expense_amount_id').sum({ amount: 'amount' }).where('user_id', userId).whereIn('expense_amount_id', allocationIds).orderBy('expense_amount_id').groupBy('expense_amount_id');
                        const allocatedByAmount = Object.fromEntries(existingAllocations.map((allocation) => [allocation.expense_amount_id, Number(allocation.amount)]));
                        for (const allocation of lineAllocations) {
                            const purchase = allocatedAmounts.find((item) => Number(item.id) === Number(allocation.expenseAmountId));
                            if (Number(allocation.amount) > Number(purchase.amount) - Number(allocatedByAmount[purchase.id] || 0) + 0.001) throw new Error('Credit allocation exceeds the purchase remaining amount.');
                        }
                    }
                    await CreditPaymentAllocation.replacePaymentAllocations(userId, paymentId, lineAllocations.map((allocation) => ({ expense_amount_id: allocation.expenseAmountId, amount: allocation.amount })), trx);
                    return paymentId;
                });
                if (line.isFullPaid) {
                    await ExpenseAmountSchedule.upsert(userId, line.expenseAmountId, currentYear, currentMonth, line.amount);
                }
                payment.push(paymentId);
            }
        }
        res.json({ payment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating payments.' });
    }
};
exports.getCreditPurchaseAllocations = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const paymentMethodId = Number(req.query.paymentMethodId);
        const currencyId = Number(req.query.currencyId);
        if (!userId || !paymentMethodId || !currencyId) return res.json({ purchases: [] });
        const purchases = await knex('expenses as expenses')
            .select('expenses.id as expense_id', 'expenses.name', 'expense_amounts.id as expense_amount_id', 'expense_amounts.amount', 'currencies.symbol as currency_symbol')
            .where({ 'expenses.user_id': userId, 'expenses.payment_method_id': paymentMethodId, 'expenses.is_credit_card_purchase': 1, 'expenses.inactive': 0, 'expense_amounts.currency_id': currencyId })
            .leftJoin('expense_amounts', 'expense_amounts.expense_id', 'expenses.id')
            .leftJoin('currencies', 'currencies.id', 'expense_amounts.currency_id')
            .orderBy('expenses.due_date')
            .orderBy('expenses.id');
        const allocationRows = await CreditPaymentAllocation.getPurchaseAllocations(userId, purchases.map((purchase) => purchase.expense_amount_id));
        const allocatedByAmount = allocationRows.reduce((totals, allocation) => ({ ...totals, [allocation.expense_amount_id]: (totals[allocation.expense_amount_id] || 0) + Number(allocation.amount) }), {});
        return res.json({ purchases: purchases.map((purchase) => ({ ...purchase, allocated: allocatedByAmount[purchase.expense_amount_id] || 0, remaining: Math.max(0, Number(purchase.amount) - (allocatedByAmount[purchase.expense_amount_id] || 0)) })) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while fetching credit purchases.' });
    }
};
exports.getPayment = async (req, res, next) => {
    try {
        let payment;
        let expenses;
        let paymentMethods;
        const userId = req.user && req.user.id;
        const paymentId = req.query && req.query.paymentId;
        if (userId && paymentId) {
            const user = await User.getById(userId);
            const { month: currentMonth, year: currentYear } = UserTime.getCurrentPeriod(user.timezone);
            payment = await Payment.getPayment(userId, paymentId);
            payment = payment && payment[0];
            expenses = await Expense.getExpenses(userId);
            // Apply scheduled amounts to expense_amounts for current month
            expenses = await Promise.all(expenses.map(async (expense) => {
                if (expense.expense_amounts && expense.expense_amounts.length > 0) {
                    expense.expense_amounts = await Promise.all(expense.expense_amounts.map(async (expenseAmount) => {
                        const expenseAmountSchedule = await ExpenseAmountSchedule.getByMonth(expenseAmount.id, currentMonth, currentYear);
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
        if (userId) {
            const user = await User.getById(userId);
            const { month: currentMonth, year: currentYear } = UserTime.getCurrentPeriod(user.timezone);
            expenses = await Expense.getExpenses(userId);
            // Apply scheduled amounts to expense_amounts for current month
            expenses = await Promise.all(expenses.map(async (expense) => {
                if (expense.expense_amounts && expense.expense_amounts.length > 0) {
                    expense.expense_amounts = await Promise.all(expense.expense_amounts.map(async (expenseAmount) => {
                        const expenseAmountSchedule = await ExpenseAmountSchedule.getByMonth(expenseAmount.id, currentMonth, currentYear);
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
