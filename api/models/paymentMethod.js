const knex = require('knex')(require('../knexfile'));

module.exports = class PaymentMethod {
    constructor(id) {
        this.id = id;
    }

    /**
     * Get all expenses
     * @param userId
     * @returns {Object}
     */
    static getPaymentMethods(userId) {
        return knex('payment_methods')
            .select(
                'payment_methods.*'
            )
            .where('payment_methods.user_id', userId)
            .then((paymentMethods) => {
                return paymentMethods;
            })
            .catch((error) => {
                throw error;
            });
    }

    static getCreditPaymentMethods(userId) {
        return knex('payment_methods')
            .select('id', 'name', 'description', 'expense_id')
            .where({ user_id: userId, is_credit: 1 })
            .orderBy('name');
    }

    static getCreditStatementPayments(userId, paymentMethodIds) {
        if (!paymentMethodIds.length) return Promise.resolve([]);
        return knex('payment_methods')
            .select(
                'payment_methods.id as payment_method_id',
                'expenses.name as statement_name',
                'expense_amounts.id as expense_amount_id',
                'expense_amounts.currency_id',
                'expense_amounts.amount',
                'payments.amount as payment_amount',
                'payments.is_full_paid'
            )
            .where('payment_methods.user_id', userId)
            .whereIn('payment_methods.id', paymentMethodIds)
            .leftJoin('expenses', 'expenses.id', 'payment_methods.expense_id')
            .leftJoin('expense_amounts', 'expense_amounts.expense_id', 'payment_methods.expense_id')
            .leftJoin('payments', 'payments.expense_amount_id', 'expense_amounts.id');
    }

    /**
     * Get expense
     * @param userId
     * @param paymentMethodId
     * @returns {Object}
     */
    static getPaymentMethod(userId, paymentMethodId) {
        return knex('payment_methods')
            .select(
                'payment_methods.*'
            )
            .where('payment_methods.user_id', userId)
            .andWhere('payment_methods.id', paymentMethodId)
            .then((paymentMethods) => {
                return paymentMethods;
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Creates a new payment method
     * @param userId
     * @param data
     * @return {Promise<UnknownOrCurlyCurlyToAny<Knex.ResolveTableType<number>>[]>}
     */
    static newPaymentMethod(userId, data, trx = null) {
        data.user_id = userId;
        const query = (trx || knex)('payment_methods');
        return query
            .insert(data)
            .then((paymentMethod) => {
                return paymentMethod;
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Updates a payment method
     * @param id
     * @param userId
     * @param data
     * @return {Promise<T>}
     */
    static updatePaymentMethod(id, userId, data, trx = null) {
        const query = (trx || knex)('payment_methods');
        return query
            .where({
                id: id,
                user_id: userId
            })
            .update(data)
            .then((paymentMethod) => {
                return paymentMethod;
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Clears default flag from payment methods for a user
     * @param userId
     * @param exceptPaymentMethodId
     * @param trx
     * @return {Promise<T>}
     */
    static clearDefaultPaymentMethod(userId, exceptPaymentMethodId = null, trx = null) {
        const query = (trx || knex)('payment_methods')
            .where({ user_id: userId, is_default: 1 });

        if (exceptPaymentMethodId) {
            query.andWhereNot('id', exceptPaymentMethodId);
        }

        return query
            .update({ is_default: 0 })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Deletes a payment method
     * @param id
     * @param userId
     */
    static deletePaymentMethod(id, userId) {
        return knex('payment_methods')
            .where({
                id: id,
                user_id: userId
            })
            .del();
    }
    /**
     * Deletes a payment method by expense
     * @param userId
     * @param expenseId
     */
    static deleteByExpense(userId, expenseId) {
        return knex('payment_methods')
            .where({
                user_id: userId,
                expense_id: expenseId
            })
            .del();
    }
    /**
     * Get payment method by expense
     * @param userId
     * @param expenseId
     * @returns {Object}
     */
    static getPaymentMethodsByExpense(userId, expenseId) {
        return knex('payment_methods')
            .select(
                'payment_methods.*'
            )
            .where('payment_methods.expense_id', expenseId)
            .then((paymentMethods) => {
                return paymentMethods;
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * Updates payment method by expense
     * @param userId
     * @param expenseId
     * @returns {Object}
     */
    static updatePaymentMethodsByExpense(userId, expenseId) {
        return knex('payment_methods')
            .where({
                expense_id: expenseId,
                user_id: userId
            })
            .update({
                expense_id: null
            })
            .then((paymentMethod) => {
                return paymentMethod;
            })
            .catch((error) => {
                throw error;
            });
    }
};
