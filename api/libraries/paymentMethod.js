const { MONTHLY_ID } = require('../models/expenseType');
const Category = require("../models/category");
const Utils = require("../utils/utils");
const Expense = require("../models/expense");
const Budget = require("../models/budget");
const Bill = require("../models/bill");
const PaymentMethod = require("../models/paymentMethod");
const PaymentLibrary = require("../libraries/payment");

/**
 * Creates a new expense and category for a credit card payment method
 * @param userId
 * @param name
 * @param dueDateDay
 * @param currencies
 * @return {Promise<*|null>}
 */
exports.createPaymentMethodExpense = async (userId, name, dueDateDay, currencies) => {
    let expense;
    let expenseAmount;
    const category = await Category.newCategory(userId, name, 'bi-credit-card');
    const categoryId = category && category.length && category[0];
    const formattedDate = Utils.getNextDay(dueDateDay);
    const expenseData = {
        name,
        category_id: categoryId,
        type_id: MONTHLY_ID,
        due_date: formattedDate
    }
    expense = await Expense.create(userId, expenseData);
    expense = expense.length && expense[0];
    if (currencies && currencies.length) {
        for (const currency of currencies) {
            expenseAmount = await Expense.newExpenseAmount({
                expense_id: expense,
                currency_id: currency.id,
                amount: 0
            });
        }
    }
    return expense;
}
/**
 * Removes a new expense and category for a credit card payment method
 * @param userId
 * @param paymentMethodId
 * @return {Promise<*|null>}
 */
exports.removePaymentMethodExpense = async (userId, paymentMethodId) => {
    let category = await Category.getCategoryByPaymentMethodId(paymentMethodId);
    category = category && category.length && category[0];
    const categoryId = category && category.id;
    await Budget.deleteByCategory(userId, categoryId);
    await Bill.deleteByCategory(userId, categoryId);
    let expenses = await Expense.getExpensesByCategory(userId, categoryId);
    for (const expense of expenses) {
        await Expense.update(expense.id, userId, { payment_method_id: null });
        await PaymentMethod.updatePaymentMethodsByExpense(userId, expense.id);
        await PaymentLibrary.removePaymentsByExpense(userId, expense.id);
        await Expense.deleteExpense(expense.id, userId);
    }
    await Category.deleteCategory(categoryId, userId);
}
