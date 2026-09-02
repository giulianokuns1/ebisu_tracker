const { MONTHLY_ID } = require("./expenseType");
const knex = require('knex')(require('../knexfile'));

module.exports = class Payment {
    constructor(id) {
        this.id = id;
    }
    /**
     * Get all payments by user
     * @param userId
     * @param month
     * @param year
     * @returns {Object}
     */
    static getPayments(userId, month, year) {
        return knex('payments')
            .select(
                'payments.*',
                'expenses.name as expense_name',
                'expense_amounts.amount as expense_amount_amount',
                'categories.name as category_name',
                'categories.icon as category_icon',
                'currencies.id as currency_id',
                'currencies.name as currency_name',
                'currencies.symbol as currency_symbol',
                'expenses_type.name as expenses_type_name',
                'payment_methods.name as payment_method_name'
            )
            .where('payments.user_id', userId)
            .where(function () {
                if (month !== undefined && month !== null) {
                    this.whereRaw('MONTH(payments.created_at) = ?', [month]);
                    if (year !== undefined && year !== null) {
                        this.andWhereRaw('YEAR(payments.created_at) = ?', [year]);
                    }
                } else if (year !== undefined && year !== null) {
                    this.whereRaw('YEAR(payments.created_at) = ?', [year]);
                }
            })
            .leftJoin('expense_amounts', 'payments.expense_amount_id', 'expense_amounts.id')
            .leftJoin('expenses', 'expense_amounts.expense_id', 'expenses.id')
            .leftJoin('categories', 'expenses.category_id', 'categories.id')
            .leftJoin('currencies', 'expense_amounts.currency_id', 'currencies.id')
            .leftJoin('expenses_type', 'expenses.type_id', 'expenses_type.id')
            .leftJoin('payment_methods', 'payments.payment_method_id', 'payment_methods.id')
            .orderBy('payments.created_at', 'desc')
            .then((payments) => {
                return payments;
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * Get all credit payments by user and month
     * @param userId
     * @param month
     * @param year
     * @returns {Object}
     */
    static getCreditPayments(userId, month, year) {
        return knex('payments')
            .select(
                'payments.*',
                'expenses.name as expense_name',
                'expense_amounts.amount as expense_amount_amount',
                'categories.name as category_name',
                'categories.icon as category_icon',
                'currencies.id as currency_id',
                'currencies.name as currency_name',
                'currencies.symbol as currency_symbol',
                'expenses_type.name as expenses_type_name',
            )
            .where('payments.user_id', userId)
            .where('payment_methods.is_credit', 1)
            .where(function () {
                if (month !== undefined && month !== null) {
                    this.whereRaw('MONTH(payments.created_at) = ?', [month]);
                    if (year !== undefined && year !== null) {
                        this.andWhereRaw('YEAR(payments.created_at) = ?', [year]);
                    }
                } else if (year !== undefined && year !== null) {
                    this.whereRaw('YEAR(payments.created_at) = ?', [year]);
                }
            })
            .leftJoin('expense_amounts', 'payments.expense_amount_id', 'expense_amounts.id')
            .leftJoin('expenses', 'expense_amounts.expense_id', 'expenses.id')
            .leftJoin('categories', 'expenses.category_id', 'categories.id')
            .leftJoin('currencies', 'expense_amounts.currency_id', 'currencies.id')
            .leftJoin('expenses_type', 'expenses.type_id', 'expenses_type.id')
            .leftJoin('payment_methods', 'payments.payment_method_id', 'payment_methods.id')
            .orderBy('payments.created_at', 'desc')
            .then((payments) => {
                return payments;
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * Create a new payment
     * @param userId
     * @param expenseAmountId
     * @param paymentMethod
     * @param amount
     * @param comment
     * @param originalAmount
     * @param isCreditPayment
     * @param paymentDate
     * @param isFullPaid
     * @returns {Object}
     */
    static createPayment(userId, expenseAmountId, paymentMethod, amount, comment, originalAmount, isCreditPayment = false, paymentDate, isFullPaid = false, trx = null) {
        const query = trx || knex;
        return query('payments')
            .insert({
                user_id: userId,
                amount: amount,
                comment: comment,
                original_amount: originalAmount,
                expense_amount_id: expenseAmountId,
                payment_method_id: paymentMethod,
                is_credit_payment: isCreditPayment,
                created_at: paymentDate,
                is_full_paid: isFullPaid
            });
    }
    /**
     * Updates an payment
     * @param id
     * @param userId
     * @param expenseAmount
     * @param paymentMethod
     * @param amount
     * @param comment
     * @param originalAmount
     * @param paymentDate
     * @returns {*|null}
     */
    static updatePayment(id, userId, expenseAmount, paymentMethod, amount, comment, originalAmount, paymentDate) {
        return knex('payments')
            .where({
                id: id,
                user_id: userId
            })
            .update({
                user_id: userId,
                expense_amount_id: expenseAmount,
                payment_method_id: paymentMethod,
                amount: amount,
                comment: comment,
                original_amount: originalAmount,
                created_at: paymentDate
            });
    }
    /**
     * Deletes an payment
     * @param id
     * @param userId
     */
    static deletePayment(id, userId) {
        return knex('payments')
            .where({
                id: id,
                user_id: userId
            })
            .del();
    }
    /**
     * Get payment
     * @returns {Object}
     */
    static getPayment(userId, paymentId) {
        return knex('payments')
            .select(
                'payments.*',
                'expenses.id as expense_id',
                'expenses.name as expense_name',
                'expense_amounts.amount as expense_amount_amount',
                'categories.name as category_name',
                'categories.icon as category_icon',
                'currencies.name as currency_name',
                'currencies.symbol as currency_symbol',
                'expenses_type.name as expenses_type_name',
            )
            .where('payments.user_id', userId)
            .andWhere('payments.id', paymentId)
            .leftJoin('expense_amounts', 'payments.expense_amount_id', 'expense_amounts.id')
            .leftJoin('expenses', 'expense_amounts.expense_id', 'expenses.id')
            .leftJoin('categories', 'expenses.category_id', 'categories.id')
            .leftJoin('currencies', 'expense_amounts.currency_id', 'currencies.id')
            .leftJoin('expenses_type', 'expenses.type_id', 'expenses_type.id')
            .then((payments) => {
                return payments;
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Get payments by expense
     * @param userId
     * @param expensesIds
     * @param year
     * @param monthRange
     * @param isCredit
     * @param limit
     * @returns {Object}
     */
    static getExpensesPayments(userId, expensesIds = null, year = null, monthRange, isCredit = null, limit = null) {
        const query = knex('payments')
            .select(
                'payments.*',
                'expenses.id as expense_id',
                'expenses.name as expense_name',
                'expense_amounts.amount as expense_amount_amount',
                'expense_amounts.currency_id as expense_amount_currency_id',
                'categories.name as category_name',
                'categories.icon as category_icon',
                'currencies.name as currency_name',
                'currencies.symbol as currency_symbol',
                'expenses_type.name as expenses_type_name',
                'payment_methods.name as payment_method_name',
                'payment_methods.is_credit as payment_method_is_credit',
                'payment_methods.expense_id as payment_method_expense_id',
                'payment_methods.due_date_day as payment_method_due_date_day'
            )
            .where('payments.user_id', userId)
            .where(function () {
                if (isCredit !== undefined && isCredit !== null) {
                    this.where('payment_methods.is_credit', isCredit)
                }
            })
            .where(function () {
                if (expensesIds !== undefined && expensesIds !== null) {
                    this.whereIn('expense_amounts.expense_id', expensesIds)
                }
            })
            .where(function () {
                if (year !== undefined && year !== null) {
                    this.whereRaw('YEAR(payments.created_at) = ?', [year]);
                }
            })
            .leftJoin('expense_amounts', 'payments.expense_amount_id', 'expense_amounts.id')
            .leftJoin('expenses', 'expense_amounts.expense_id', 'expenses.id').leftJoin('categories', 'expenses.category_id', 'categories.id')
            .leftJoin('currencies', 'expense_amounts.currency_id', 'currencies.id')
            .leftJoin('expenses_type', 'expenses.type_id', 'expenses_type.id')
            .leftJoin('payment_methods', 'payments.payment_method_id', 'payment_methods.id');
        if (monthRange) {
            query.whereRaw('payments.created_at BETWEEN ? AND ?', [monthRange.startDate, monthRange.endDate]);
        }
        if (limit) {
            query.limit(limit);
        }
        return query
            .orderBy('payments.created_at', 'desc')
            .then((payments) => {
                return payments;
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Deletes a payment by Expense
     * @param userId
     * @param expenseId
     */
    static deleteByExpense(userId, expenseId) {
        return knex('payments')
            .where('payments.user_id', userId)
            .andWhere('expense_amounts.expense_id', expenseId)
            .leftJoin('expense_amounts', 'payments.expense_amount_id', 'expense_amounts.id')
            .leftJoin('expenses', 'expense_amounts.expense_id', 'expenses.id')
            .del();
    }

    /**
     * Deletes an payment by expense amount
     * @param userId
     * @param expenseAmountId
     * @return {Knex.QueryBuilder<TRecord, number>}
     */
    static deletePaymentsByExpenseAmount(userId, expenseAmountId) {
        return knex('payments')
            .where({
                user_id: userId,
                expense_amount_id: expenseAmountId
            })
            .del();
    }
};
