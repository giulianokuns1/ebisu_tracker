const Expense = require('../models/expense');
const Payment = require('../models/payment');
const PaymentMethod = require('../models/paymentMethod');
const CreditPaymentAllocation = require('../models/creditPaymentAllocation');
const moment = require("moment");

/**
 * Delete payments by expense
 * @param userId
 * @param expenseId
 * @return {Promise<*|null>}
 */
exports.removePaymentsByExpense = async (userId, expenseId) => {
    await Payment.deleteByExpense(userId, expenseId);
    await Expense.deleteExpenseAmountByExpense(userId, expenseId);
}
/**
 * Create a new payment
 * @param userId
 * @param expenseAmountId
 * @param paymentMethodId
 * @param amount
 * @param comment
 * @param originalAmount
 * @param expense
 * @param paymentDate
 * @param isFullPaid
 * @return {Promise<void>}
 */
exports.createPayment = async (userId, expenseAmountId, paymentMethodId, amount, comment, originalAmount, expense, paymentDate, isFullPaid) => {
    const isCreditPayment = expense && !!expense.payment_method_id;
    await Payment.createPayment(userId, expenseAmountId, paymentMethodId, amount, comment, originalAmount, isCreditPayment, paymentDate, isFullPaid);
}
/**
 * Get credit payments by expenses
 * @param userId
 * @param expensesIds
 * @return {Promise<*|Promise<*>>}
 */
exports.getCreditPaymentsByExpenses = async (userId, expensesIds) => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    const lastMonth = date.getMonth() + 1;
    const year = date.getFullYear();
    return Payment.getExpensesPayments(userId, expensesIds, year, lastMonth, 1);
}
/**
 *
 * @param userId
 * @param expenseId
 * @return {Promise<*|Promise<*>>}
 */
exports.getPaymentsByExpense = async (userId, expenseId) => {
    let payments = await Payment.getExpensesPayments(userId, [expenseId]);
    const allocationPayments = await CreditPaymentAllocation.getPaymentHistory(userId, expenseId);
    const historyPayments = [...payments, ...allocationPayments.map((allocation) => ({
        ...allocation,
        id: `credit-allocation-${allocation.id}`,
        comment: 'Paid by credit',
        is_credit_allocation: true,
    }))].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    let monthPayments = [];
    let month;
    let index;
    let totalPaid = 0;
    historyPayments.map((payment) => {
        month = moment(payment.created_at).format('YYYY-MM');
        index = monthPayments.findIndex((monthPayment) => monthPayment.month === month);
        if (index === -1) {
            monthPayments.push({
                month: month,
                monthText: moment(month).format('MMMM'),
                yearMonth: moment(month).format('MMMM YYYY'),
                payments: [],
                total: 0
            });
            index = monthPayments.length - 1;
        }
        monthPayments[index].payments.push(payment);
        monthPayments[index].total += payment.amount;
        totalPaid = parseFloat(parseFloat(totalPaid) + parseFloat(payment.amount)).toFixed(2);
    });
    return {
        payments: historyPayments,
        monthPayments,
        totalPaid
    };
}
