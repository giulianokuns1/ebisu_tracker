const Expense = require("../models/expense");
const Payment = require("../models/payment");
const PaymentMethods = require("../models/paymentMethod");
const Utils = require("../utils/utils");
const ExpenseType = require("../models/expenseType");
const ExpenseSchedule = require("../models/expenseSchedule");
const ExpenseAmountSchedule = require("../models/expenseAmountSchedule");
const Currency = require("../models/currency");
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
        due_date_day: data.expenseDueDay
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
        await this.updateExpenseAmounts(userId, expenseId, expenseAmounts, null, !!data.expensePaymentMethod);
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
exports.updateExpenseAmounts = async (userId, expenseId, expenseAmounts, expenseAmountsToDelete = null, isCreditExpense = false) => {
    const orderedCurrencies = await Currency.getCurrencies(userId);
    const fallbackCurrencyId = orderedCurrencies && orderedCurrencies.length ? orderedCurrencies[0].id : null;

    if (expenseAmountsToDelete && expenseAmountsToDelete.length) {
        expenseAmountsToDelete.map(async (expenseAmount) => {
            if (isCreditExpense) {
                await ExpenseAmountSchedule.delete(expenseAmount.id);
            }
            await Payment.deletePaymentsByExpenseAmount(userId, expenseAmount.id)
            await Expense.deleteExpenseAmount(expenseAmount.id);
        });
    }
    if (expenseAmounts && expenseAmounts.length) {
        expenseAmounts.map(async (expenseAmount) => {
            if (isCreditExpense) {
                await ExpenseAmountSchedule.delete(expenseAmount.id);
            }
            const data = {
                expense_id: expenseId,
                currency_id: expenseAmount.currency_id || fallbackCurrencyId,
                amount: isCreditExpense ? 0 : expenseAmount.amount
            }
            if (!data.currency_id) {
                return;
            }
            if (expenseAmount.id) {
                await Expense.updateExpenseAmount(expenseAmount.id, data);
            } else if (!expenseAmount.id) {
                await Expense.newExpenseAmount(data);
            }
            if (isCreditExpense && expenseAmount.amount > 0) {
                await ExpenseAmountSchedule.upsert(userId, expenseAmount.id, moment().month() + 1, expenseAmount.amount);
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
exports.getCreditExpenses = async (userId, month, year, paymentMethods, expense) => {
    let paymentMethod = paymentMethods.find((paymentMethod) => paymentMethod.id === expense.payment_method_id);
    let lastMonthRange = Utils.getLastMonthBasedOnDueDay(paymentMethod.due_date_day, month);
    expense.formattedDueDate = Utils.creditExpenseFormattedDueDate(paymentMethod.statement_date_day, month);
    return Payment.getExpensesPayments(userId, null, year, lastMonthRange, 1);
}
/**
 * Get expenses
 * @param userId
 * @param month
 * @param year
 * @return {Promise<void>}
 */
exports.getExpenses = async (userId, month, year ) => {
    let creditPayments;
    let expenses = await Expense.getExpenses(userId, month, year);
    let paymentMethods = await PaymentMethods.getPaymentMethods(userId);
    expenses = await Promise.all(expenses.map(async (expense) => {
        expense.formattedDueDate = Utils.expenseFormattedDueDate(expense, String(month));
        expense.formattedGridDueDate = Utils.expenseFormattedGridDueDate(expense, String(month));
        expense.paymentMethods = paymentMethods;
        if (expense.payment_method_id) {
            creditPayments = await this.getCreditExpenses(userId, month, year, paymentMethods, expense);
            expense.expense_amounts = await Promise.all(expense.expense_amounts.map(async (expenseAmount) => {
                expenseAmount.payments = [];
                expenseAmount.amount = 0;
                creditPayments.forEach((payment) => {
                    if (payment.expense_amount_currency_id === expenseAmount.currency_id && expense.payment_method_id === payment.payment_method_id) {
                        expenseAmount.payments.push(payment);
                        expenseAmount.amount += parseFloat(payment.amount);
                    }
                });
                return expenseAmount;
            }));
            return expense;
        }
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
exports.getExpensesExtended = async (userId, month, payments, creditPayments, currencies, showAll) => {
    let expenses = await Expense.getExpensesByAmount(userId, showAll ? null : month);
    let paymentMethods = await PaymentMethods.getPaymentMethods(userId);
    let expenseAmountSchedules = await ExpenseAmountSchedule.getByUserId(userId, month);
    let expensesAmountByCurrency = {};
    let amountPaidByCurrency = {};
    let amountPendingByCurrency = {};
    let totalAmountByCurrency = {};
    let pendingExpenses = [];
    let paymentByExpense = {}
    let paid;
    let percentage;
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
    creditPayments.forEach((creditPayment) => {
        const creditPaymentAmount = parseFloat(creditPayment.amount) || 0;
        if (amountPaidByCurrency[creditPayment.currency_id]) {
            amountPaidByCurrency[creditPayment.currency_id] += creditPaymentAmount;
        } else {
            amountPaidByCurrency[creditPayment.currency_id] = creditPaymentAmount;
        }
        if (!paymentByExpense[creditPayment.expense_amount_id]) {
            paymentByExpense[creditPayment.expense_amount_id] = creditPaymentAmount;
        } else {
            paymentByExpense[creditPayment.expense_amount_id] += creditPaymentAmount;
        }
    });
    expenses.map(expense => {
        expense.payments = [];
        expense.paymentTotal = 0;
        expense.formattedDueDate = Utils.expenseFormattedDueDate(expense, String(month));
        expense.formattedGridDueDate = Utils.expenseFormattedGridDueDate(expense, String(month));
        expense.dueDateDay = expense.due_date_day || moment(expense.due_date).format('D');
        expense.paymentMethods = paymentMethods;

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
        if (expense.payment_method_id && !expense.expense_amount_schedule_amount) {
            creditPayments.forEach((payment) => {
                if (payment.payment_method_id === expense.payment_method_id && payment.currency_id === expense.currency_id) {
                    expense.amount = parseFloat(expense.amount) + parseFloat(payment.amount);
                }
            });
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

exports.getExpenseAmountByExpense = async (userId, expenseId) => {
    var expenseAmounts = await Expense.getExpenseAmountByExpense(userId, expenseId);
    var result = await Promise.all(expenseAmounts.map(async expenseAmount => {
        var expenseAmountSchedule = await ExpenseAmountSchedule.getByMonth(expenseAmount.id, moment().month() + 1);
        if (expenseAmountSchedule.length > 0) {
            expenseAmount.amount = expenseAmountSchedule[0].amount;
        }
        return expenseAmount;
    }));
    return await Promise.all(result);
}
