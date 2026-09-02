const knex = require('knex')(require('../knexfile'));

module.exports = class CreditPaymentAllocation {
    static async getPurchaseAllocations(userId, expenseAmountIds) {
        if (!expenseAmountIds.length) return [];
        return knex('credit_payment_allocations as allocations')
            .select('allocations.*', 'payments.created_at as payment_date', 'payment_methods.name as payment_method_name')
            .where('allocations.user_id', userId)
            .whereIn('allocations.expense_amount_id', expenseAmountIds)
            .leftJoin('payments', 'payments.id', 'allocations.payment_id')
            .leftJoin('payment_methods', 'payment_methods.id', 'payments.payment_method_id');
    }

    static async getPaymentHistory(userId, expenseId) {
        return knex('credit_payment_allocations as allocations')
            .select(
                'allocations.id',
                'allocations.amount',
                'payments.created_at',
                'payments.id as source_payment_id',
                'expenses.name as expense_name',
                'categories.name as category_name',
                'categories.icon as category_icon',
                'currencies.symbol as currency_symbol',
                'payment_methods.name as payment_method_name',
                'statement_expenses.name as statement_expense_name'
            )
            .where('allocations.user_id', userId)
            .where('expense_amounts.expense_id', expenseId)
            .leftJoin('expense_amounts', 'expense_amounts.id', 'allocations.expense_amount_id')
            .leftJoin('expenses', 'expenses.id', 'expense_amounts.expense_id')
            .leftJoin('payments', 'payments.id', 'allocations.payment_id')
            .leftJoin('payment_methods', 'payment_methods.id', 'payments.payment_method_id')
            .leftJoin('expense_amounts as statement_amounts', 'statement_amounts.id', 'payments.expense_amount_id')
            .leftJoin('expenses as statement_expenses', 'statement_expenses.id', 'statement_amounts.expense_id')
            .leftJoin('categories', 'categories.id', 'expenses.category_id')
            .leftJoin('currencies', 'currencies.id', 'expense_amounts.currency_id')
            .orderBy('payments.created_at', 'desc');
    }

    static async replacePaymentAllocations(userId, paymentId, allocations, trx) {
        const query = trx || knex;
        await query('credit_payment_allocations').where({ user_id: userId, payment_id: paymentId }).del();
        if (allocations.length) await query('credit_payment_allocations').insert(allocations.map((allocation) => ({ ...allocation, user_id: userId, payment_id: paymentId })));
    }
};
