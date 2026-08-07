const Category = require("../models/category");
const Budget = require("../models/budget");
const Bill = require("../models/bill");
const Expense = require("../models/expense");
const Payment = require("../models/payment");
const PaymentMethod = require("../models/paymentMethod");
const ExpenseLibrary = require("../libraries/expense");
/**
 * Delete a category
 * @param userId
 * @param categoryId
 * @return {Promise<*|null>}
 */
exports.deleteCategory = async (userId, categoryId) => {
    await Budget.deleteByCategory(userId, categoryId);
    await Bill.deleteByCategory(userId, categoryId);
    let expenses = await Expense.getExpensesByCategory(userId, categoryId);
    for (const expense of expenses) {
        await Expense.update(expense.id, userId, { payment_method_id: null });
        await Payment.deleteByExpense(userId, expense.id);
        await PaymentMethod.deleteByExpense(userId, expense.id);
        await ExpenseLibrary.deleteExpense(userId, expense.id);
    }
    const category = await Category.deleteCategory(categoryId, userId);
    return category && category.length && category[0];
};
