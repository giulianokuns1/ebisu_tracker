const Expense = require("../models/expense");
const Payment = require("../models/payment");
const Utils = require("../utils/utils");
const ExpenseType = require("../models/expenseType");
const ExpenseSchedule = require("../models/expenseSchedule");
const ExpenseAmountSchedule = require("../models/expenseAmountSchedule");
const Currency = require("../models/currency");
const PaymentMethod = require("../models/paymentMethod");
const moment = require("moment");

exports.createUpdateExpense = async (userId, data) => {
    let expenseData;
    let expenseId;
    let expense;
    let expenseAmounts = data.expenseAmounts;
    let id = data.id;
    let expenseScheduleData = [];
    let isScheduled = parseInt(data.expenseType, 10) === ExpenseType.SCHEDULED_ID && data.scheduledMonths;
    expenseData = {
        name: data.name,
        category_id: data.category,
        type_id: data.expenseType,
        due_date: data.expenseDueDate,
        due_date_day: data.expenseDueDay,
        payment_method_id: data.paymentMethodId,
        is_credit_card_purchase: Boolean(data.paymentMethodId) && Number(data.paymentMethodExpenseId) !== Number(id)
    }
    expenseData = Utils.addFieldsToObject({}, expenseData);
    if (isScheduled) {
        expenseData.due_date = null;
    }
    if (id) {
        await Expense.update(id, userId, expenseData);
        expenseId = id;
    } else {
        expense = await Expense.create(userId, expenseData);
        expenseId = expense && expense.length && expense[0];
    }
    if (expenseId && expenseAmounts) {
        await this.updateExpenseAmounts(userId, expenseId, expenseAmounts);
    }
    ExpenseSchedule.delete(expenseId);
    if (parseInt(data.expenseType, 10) === ExpenseType.SCHEDULED_ID && data.scheduledMonths) {
        data.scheduledMonths.map((scheduledMonth) => {
            const month = scheduledMonth.value;
            expenseScheduleData.push({
                expense_id: expenseId,
                month: month
            });
        });
        ExpenseSchedule.create(expenseScheduleData);
    }
    if (expenseId && data.amountSchedule) {
        const allowedMonths = isScheduled ? new Set((data.scheduledMonths || []).map((item) => Number(item.value))) : null;
        const persistedExpenseAmounts = await Expense.getExpenseAmount(userId, expenseId);
        const expenseAmountIds = new Set(persistedExpenseAmounts.map((amount) => Number(amount.id)));
        for (const item of data.amountSchedule) {
            const expenseAmountId = Number(item.expenseAmountId) || Number(persistedExpenseAmounts.find((amount) => Number(amount.currency_id) === Number(item.currencyId))?.id);
            const year = Number(item.year);
            const month = Number(item.month);
            const amount = Number(item.amount);
            if (!expenseAmountIds.has(expenseAmountId) || !Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12 || amount < 0 || (allowedMonths && !allowedMonths.has(month))) {
                continue;
            }
            await ExpenseAmountSchedule.upsert(userId, expenseAmountId, year, month, amount);
        }
    }
    return expenseId;
}

/**
 * Creates or updates an expense amounts
 * @param userId
 * @param expenseId
 * @param expenseAmounts
 * @param expenseAmountsToDelete
 * @return {Promise<*|null>}
 */
exports.updateExpenseAmounts = async (userId, expenseId, expenseAmounts, expenseAmountsToDelete = null) => {
    const orderedCurrencies = await Currency.getCurrencies(userId);
    const fallbackCurrencyId = orderedCurrencies && orderedCurrencies.length ? orderedCurrencies[0].id : null;

    if (expenseAmountsToDelete && expenseAmountsToDelete.length) {
        expenseAmountsToDelete.map(async (expenseAmount) => {
            await Payment.deletePaymentsByExpenseAmount(userId, expenseAmount.id)
            await Expense.deleteExpenseAmount(expenseAmount.id);
        });
    }
    if (expenseAmounts && expenseAmounts.length) {
        expenseAmounts.map(async (expenseAmount) => {
            const data = {
                expense_id: expenseId,
                currency_id: expenseAmount.currency_id || fallbackCurrencyId,
                amount: expenseAmount.amount
            }
            if (!data.currency_id) {
                return;
            }
            if (expenseAmount.id) {
                await Expense.updateExpenseAmount(expenseAmount.id, data);
            } else if (!expenseAmount.id) {
                await Expense.newExpenseAmount(data);
            }
        });
    }
}
/**
 * Delete an expense
 * @param userId
 * @param expenseId
 * @return {Promise<void>}
 */
exports.deleteExpense = async (userId, expenseId) => {
    await Payment.deleteByExpense(userId, expenseId);
    await Expense.deleteExpenseAmountByExpense(userId, expenseId);
    await Expense.deleteExpense(expenseId, userId);
}
/**
 * Get credit payments by expenses
 * @param userId
 * @param month
 * @param year
 * @param paymentMethods
 * @param expense
 * @return {Promise<*>}
 */
/**
 * Get expenses
 * @param userId
 * @param month
 * @param year
 * @return {Promise<void>}
 */
exports.getExpenses = async (userId, month, year ) => {
    let expenses = await Expense.getExpenses(userId, month, year);
    expenses = await Promise.all(expenses.map(async (expense) => {
        expense.formattedDueDate = Utils.expenseFormattedDueDate(expense, String(month));
        expense.formattedGridDueDate = Utils.expenseFormattedGridDueDate(expense, String(month));
        return expense;
    }));
    return expenses;
}

// /**
//  * Get the amount by expenses for a given month
//  * @param expenses
//  * @param payments
//  * @param creditPayments
//  * @param currencies
//  * @return {Promise<{amountPendingByCurrency: {}, totalAmountByCurrency: {}, pendingExpenses: *[], amountPaidByCurrency: {}}>}
//  */
// exports.getAmountByExpenses = async (expenses, payments, creditPayments, currencies) => {
//     var amountPaidByCurrency = {};
//     var amountPendingByCurrency = {};
//     var totalAmountByCurrency = {};
//     var pendingExpenses = [];
//     var paymentByExpense = {}
//     var paymentsCredit = {};
//     var paid;
//     var percentage;
//     payments.forEach((payment) => {
//         if (amountPaidByCurrency[payment.currency_id]) {
//             amountPaidByCurrency[payment.currency_id] += payment.amount;
//         } else {
//             amountPaidByCurrency[payment.currency_id] = payment.amount;
//         }
//         if (!paymentByExpense[payment.expense_amount_id]) {
//             paymentByExpense[payment.expense_amount_id] = payment.amount;
//         } else {
//             paymentByExpense[payment.expense_amount_id] += payment.amount;
//         }
//     });
//     // creditPayments.forEach((payment) => {
//     //     if (amountPaidByCurrency[payment.currency_id]) {
//     //         amountPaidByCurrency[payment.currency_id] += payment.amount;
//     //     } else {
//     //         amountPaidByCurrency[payment.currency_id] = payment.amount;
//     //     }
//     //     if (!paymentByExpense[payment.expense_amount_id]) {
//     //         paymentByExpense[payment.expense_amount_id] = payment.amount;
//     //     } else {
//     //         paymentByExpense[payment.expense_amount_id] += payment.amount;
//     //     }
//     //     if (!paymentsCredit[payment.expense_amount_id]) {
//     //         paymentsCredit[payment.expense_amount_id] = payment.amount;
//     //     } else {
//     //         paymentsCredit[payment.expense_amount_id] += payment.amount;
//     //     }
//     // });
//     expenses.map((expense) => {
//         if (expense && expense.expense_amounts && expense.expense_amounts.length > 0) {
//             expense.expense_amounts.map((expense_amount) => {
//                 if (totalAmountByCurrency[expense_amount.currency_id]) {
//                     totalAmountByCurrency[expense_amount.currency_id]['amount'] += parseInt(expense_amount.amount, 10);
//                 } else {
//                     totalAmountByCurrency[expense_amount.currency_id] = {}
//                     totalAmountByCurrency[expense_amount.currency_id]['amount'] = parseInt(expense_amount.amount, 10);
//                 }
//                 if (expense.payment_method_id && parseFloat(expense_amount.amount) === 0) {
//                     expense_amount.amount = parseFloat(paymentsCredit[expense_amount.id]);
//                 }
//                 if (paymentByExpense[expense_amount.id] && paymentByExpense[expense_amount.id] < expense_amount.amount) {
//                     paid = paymentByExpense[expense_amount.id];
//                     percentage = Math.round((paid / expense_amount.amount) * 100);
//                     if (pendingExpenses.length < 10) {
//                         pendingExpenses.push({ expense: expense, paid: paid, percentage: percentage, expenseAmount: expense_amount });
//                     }
//                 }
//                 if (!amountPaidByCurrency[expense_amount.currency_id]) {
//                     amountPaidByCurrency[expense_amount.currency_id] = 0;
//                 }
//                 if (!expense_amount.payments) {
//                     expense_amount.payments = [];
//                     expense_amount.paymentTotal = 0;
//                 }
//                 payments.map(payment => {
//                     if (payment.expense_amount_id === expense_amount.id) {
//                         expense_amount.payments.push(payment);
//                         expense_amount.paymentTotal += parseFloat(payment.amount);
//                     }
//                 });
//             });
//         }
//     });
//     currencies.map((currency) => {
//         if (totalAmountByCurrency[currency.id]) {
//             totalAmountByCurrency[currency.id]['currency'] = currency;
//         }
//     });
//     return {
//         amountPaidByCurrency,
//         amountPendingByCurrency,
//         totalAmountByCurrency,
//         pendingExpenses,
//         expenses
//     };
// }

/**
 * Get expenses with extended data. Adds payments and paymentTotal to expenses, and adds expensesAmountByCurrency.
 * @param userId
 * @param month
 * @param payments
 * @param creditPayments
 * @param currencies
 * @param showAll
 * @return {Object}
 */
exports.getExpensesExtended = async (userId, month, payments, currencies, year = new Date().getFullYear(), showAll) => {
    let expenses = await Expense.getExpensesByAmount(userId, showAll ? null : month, showAll ? null : year);
    let expenseAmountSchedules = await ExpenseAmountSchedule.getByUserId(userId, month, year);
    let expensesAmountByCurrency = {};
    let amountPaidByCurrency = {};
    let amountPendingByCurrency = {};
    let totalAmountByCurrency = {};
    let pendingExpenses = [];
    let paymentByExpense = {}
    let paid;
    let percentage;
    const creditPurchasePaymentMethodIds = [...new Set(expenses.filter((expense) => Boolean(expense.is_credit_card_purchase) && expense.payment_method_id).map((expense) => expense.payment_method_id))];
    const creditStatementPayments = await PaymentMethod.getCreditStatementPayments(userId, creditPurchasePaymentMethodIds);
    const creditStatementByMethodAndCurrency = creditStatementPayments.reduce((statements, row) => {
        const key = `${row.payment_method_id}:${row.currency_id}`;
        if (!statements[key]) statements[key] = { amount: Number(row.amount || 0), paymentTotal: 0, isFullPaid: false };
        statements[key].paymentTotal += Number(row.payment_amount || 0);
        statements[key].isFullPaid = statements[key].isFullPaid || Boolean(row.is_full_paid);
        return statements;
    }, {});
    payments.forEach((payment) => {
        const paymentAmount = parseFloat(payment.amount) || 0;
        if (amountPaidByCurrency[payment.currency_id]) {
            amountPaidByCurrency[payment.currency_id] += paymentAmount;
        } else {
            amountPaidByCurrency[payment.currency_id] = paymentAmount;
        }
        if (!paymentByExpense[payment.expense_amount_id]) {
            paymentByExpense[payment.expense_amount_id] = paymentAmount;
        } else {
            paymentByExpense[payment.expense_amount_id] += paymentAmount;
        }
    });
    expenses.map(expense => {
        expense.payments = [];
        expense.paymentTotal = 0;
        expense.formattedDueDate = Utils.expenseFormattedDueDate(expense, String(month));
        expense.formattedGridDueDate = Utils.expenseFormattedGridDueDate(expense, String(month));
        expense.dueDateDay = expense.due_date_day || moment(expense.due_date).format('D');

        // Apply scheduled amount for the current month if it exists (from join or array)
        if (expense.expense_amount_schedule_amount) {
            expense.amount = expense.expense_amount_schedule_amount;
        } else {
            // Fallback to expenseAmountSchedules array if join didn't return it
            expenseAmountSchedules.forEach(expenseAmountSchedule => {
                if (expenseAmountSchedule.expense_amount_id === expense.expense_amount_id && parseInt(expenseAmountSchedule.month, 10) === parseInt(month, 10)) {
                    expense.amount = expenseAmountSchedule.amount;
                }
            });
        }

        expense.is_credit_card_purchase = Boolean(expense.is_credit_card_purchase);
        if (!expensesAmountByCurrency[expense.currency_id]) {
            expensesAmountByCurrency[expense.currency_id] = {
                currency_id: expense.currency_id,
                amount: 0,
                currency_name: expense.currency_name,
                currency_symbol: expense.currency_symbol
            };
        }
        expensesAmountByCurrency[expense.currency_id].amount += parseFloat(expense.amount);
        payments.map(payment => {
            if (payment.expense_amount_id === expense.expense_amount_id) {
                expense.payments.push(payment);
                expense.paymentTotal = parseFloat(parseFloat(expense.paymentTotal) + parseFloat(payment.amount)).toFixed(2);
                expense.isFullPaid = expense.isFullPaid || payment.is_full_paid;
            }
        });
        if (expense.is_credit_card_purchase) return expense;
        if (totalAmountByCurrency[expense.currency_id]) {
            if (expense.expense_amount_schedule_amount) {
                totalAmountByCurrency[expense.currency_id]['amount'] += parseFloat(expense.expense_amount_schedule_amount);
            } else {
                totalAmountByCurrency[expense.currency_id]['amount'] += parseFloat(expense.amount);
            }
        } else {
            totalAmountByCurrency[expense.currency_id] = {}
            if (expense.expense_amount_schedule_amount) {
                totalAmountByCurrency[expense.currency_id]['amount'] = parseFloat(expense.expense_amount_schedule_amount);
            } else {
                totalAmountByCurrency[expense.currency_id]['amount'] = parseFloat(expense.amount);
            }
        }
        if (paymentByExpense[expense.id] && paymentByExpense[expense.id] < expense.amount) {
            paid = paymentByExpense[expense.id];
            percentage = Math.round((paid / expense.amount) * 100);
            if (pendingExpenses.length < 10) {
                pendingExpenses.push({ expense: expense, paid: paid, percentage: percentage });
            }
        }
        if (!amountPaidByCurrency[expense.currency_id]) {
            amountPaidByCurrency[expense.currency_id] = 0;
        }
        return expense;
    });
    expenses.filter((expense) => expense.is_credit_card_purchase).forEach((expense) => {
        const statement = creditStatementByMethodAndCurrency[`${expense.payment_method_id}:${expense.currency_id}`];
        const isStatementPaid = statement && (Boolean(statement.isFullPaid) || Number(statement.paymentTotal || 0) >= Number(statement.amount || 0));
        if (isStatementPaid) {
            expense.paymentTotal = Number(expense.amount || 0);
            expense.isFullPaid = true;
        }
    });
    currencies.map((currency) => {
        if (totalAmountByCurrency[currency.id]) {
            totalAmountByCurrency[currency.id]['currency'] = currency;
        }
    });
    Object.keys(totalAmountByCurrency).map((key) => {
        amountPendingByCurrency[key] =
            totalAmountByCurrency[key].amount > amountPaidByCurrency[key] ?
                Math.round((totalAmountByCurrency[key].amount - amountPaidByCurrency[key]) * 100) / 100 : 0;
    });
    return {
        expenses,
        expensesAmountByCurrency,
        amountPaidByCurrency,
        amountPendingByCurrency,
        totalAmountByCurrency,
        pendingExpenses,
    };
}

exports.getExpenseAmountByExpense = async (userId, expenseId, year = new Date().getFullYear()) => {
    return Expense.getExpenseAmountByExpense(userId, expenseId);
}
