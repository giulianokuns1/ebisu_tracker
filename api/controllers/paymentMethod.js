const PaymentMethod = require('../models/paymentMethod');
const Utils = require('../utils/utils');
const Expense = require('../models/expense');
const Category = require('../models/category');
const Currency = require('../models/currency');
const PaymentMethodLibrary = require('../libraries/paymentMethod');
const ExpenseLibrary = require('../libraries/expense');
const PaymentsType = require('../models/paymentsType');
const knex = require('knex')(require('../knexfile'));

exports.getPaymentMethods = async (req, res, next) => {
    try {
        let paymentMethods;
        const userId = req.user && req.user.id;
        if (userId) {
            paymentMethods = await PaymentMethod.getPaymentMethods(userId);
        }
        const paymentMethodTypes = await PaymentsType.getPaymentTypes();
        const creditPaymentType = await PaymentsType.getPaymentTypeByName('Credit').then((paymentType) => paymentType[0]);
        res.json({ paymentMethods, paymentMethodTypes, creditPaymentType });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching Payment Methods.' });
    }
};
exports.getPaymentMethodFormData = async (req, res, next) => {
    try {
        const userId = req.user && req.user.id;
        const currencies = await Currency.getCurrencies(userId);
        const paymentMethodTypes = await PaymentsType.getPaymentTypes();
        const creditPaymentType = await PaymentsType.getPaymentTypeByName('Credit').then((paymentType) => paymentType[0]);
        res.json({ currencies, paymentMethodTypes, creditPaymentType });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching Payment Method.' });
    }
};
exports.newPaymentMethod = async (req, res, next) => {
    try {
        let paymentMethod;
        let paymentMethodId;
        let expenseId = null;
        let data;
        let paymentMethodData;
        const { id, isCredit, name, description, dueDateDay, currencies, statementDateDay, paymentMethodType, isDefault } = req.body;
        const userId = req.user && req.user.id;
        data = {
            is_credit: isCredit,
            name: name,
            description: description,
            due_date_day: dueDateDay,
            statement_date_day: statementDateDay,
            payment_type_id: paymentMethodType,
            is_default: !!isDefault
        }
        paymentMethodData = Utils.addFieldsToObject({}, data);
        if (userId) {
            await knex.transaction(async (trx) => {
                if (id) {
                    paymentMethod = await PaymentMethod.getPaymentMethod(userId, id);
                    paymentMethod = paymentMethod && paymentMethod.length && paymentMethod[0];
                    if (paymentMethod && paymentMethod.is_credit && !isCredit) {
                        await PaymentMethodLibrary.removePaymentMethodExpense(userId, paymentMethod.id);
                    } else if (paymentMethod && !paymentMethod.is_credit && isCredit) {
                        expenseId = await PaymentMethodLibrary.createPaymentMethodExpense(userId, name, dueDateDay, currencies);
                        paymentMethodData.expense_id = expenseId;
                    }
                    if (paymentMethod && paymentMethod.is_credit && isCredit) {
                        const expenseAmounts = await Expense.getExpenseAmountByExpense(userId, paymentMethod.expense_id);
                        const expenseAmountsToDelete = expenseAmounts.filter((expenseAmount) => {
                            return !currencies.find((currency) => currency.id === expenseAmount.currency_id);
                        });
                        const expenseAmountsToUpdate = expenseAmounts.filter((expenseAmount) => {
                            return currencies.find((currency) => currency.id === expenseAmount.currency_id);
                        });
                        const expenseId = paymentMethod.expense_id;
                        const currenciesByExpense = await Currency.getCurrenciesByExpense(userId, expenseId);
                        const currenciesToAdd = currencies.filter((currency) => {
                            return !currenciesByExpense.find((currencyByExpense) => currencyByExpense.id === currency.id);
                        });
                        currenciesToAdd.map((currency) => {
                            expenseAmountsToUpdate.push({
                                currency_id: currency.id,
                                amount: 0
                            });
                        });
                        await ExpenseLibrary.updateExpenseAmounts(userId, expenseId, expenseAmountsToUpdate, expenseAmountsToDelete);
                    }

                    if (paymentMethodData.is_default) {
                        await PaymentMethod.clearDefaultPaymentMethod(userId, id, trx);
                    }

                    paymentMethod = await PaymentMethod.updatePaymentMethod(id, userId, paymentMethodData, trx);
                } else {
                    if (isCredit) {
                        expenseId = await PaymentMethodLibrary.createPaymentMethodExpense(userId, name, dueDateDay, currencies);
                        paymentMethodData.expense_id = expenseId;
                    }

                    if (paymentMethodData.is_default) {
                        await PaymentMethod.clearDefaultPaymentMethod(userId, null, trx);
                    }

                    paymentMethod = await PaymentMethod.newPaymentMethod(userId, paymentMethodData, trx);
                }
            });

            paymentMethodId = paymentMethod && paymentMethod.length && paymentMethod[0];
            if (paymentMethodId) {
                if (!id && isCredit) {
                    await Expense.update(expenseId, userId, { payment_method_id: paymentMethodId });
                }
                paymentMethod = await PaymentMethod.getPaymentMethod(userId, paymentMethodId);
                paymentMethod = paymentMethod && paymentMethod.length && paymentMethod[0];
            }
        }
        res.json({ paymentMethod });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating Payment Method.' });
    }
};
exports.getPaymentMethod = async (req, res, next) => {
    try {
        let paymentMethod;
        let selectedCurrencies;
        let paymentMethodTypes;
        const userId = req.user && req.user.id;
        const paymentMethodId = req.query && req.query.id;
        const currencies = await Currency.getCurrencies(userId);

        if (userId && paymentMethodId) {
            paymentMethod = await PaymentMethod.getPaymentMethod(userId, paymentMethodId);
            paymentMethod = paymentMethod && paymentMethod[0];
            selectedCurrencies = await Currency.getCurrenciesByExpense(userId, paymentMethod.expense_id);
            paymentMethodTypes = await PaymentsType.getPaymentTypes();
        }
        res.json({ paymentMethod, currencies, selectedCurrencies, paymentMethodTypes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the Payment Methods.' });
    }
};
exports.deletePaymentMethod = async (req, res, next) => {
    try {
        const { id } = req.body;
        const userId = req.user && req.user.id;
        if (userId && id) {
            await PaymentMethodLibrary.removePaymentMethodExpense(userId, id);
            await PaymentMethod.deletePaymentMethod(id, userId);
        }
        res.status(200).json({ message: 'Delete successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error creating the Payment Methods.' });
    }
};
