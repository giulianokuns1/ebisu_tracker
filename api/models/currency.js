const knex = require('knex')(require('../knexfile'));
module.exports = class Currency {
    constructor(id) {
        this.id = id;
    }
    /**
     * Get all currencies
     * @returns {Object}
     */
    static getCurrencies(userId = null) {
        const query = knex('currencies').select();

        if (userId) {
            query.where(function () {
                this.whereIn('currencies.id', function () {
                    this.select('currency_id').from('user_currencies').where('user_id', userId);
                }).orWhereNotExists(function () {
                    this.select(1).from('user_currencies').where('user_id', userId);
                });
            });
            query.orderByRaw(
                'CASE WHEN currencies.id = (SELECT default_currency_id FROM users WHERE id = ? LIMIT 1) THEN 0 ELSE 1 END',
                [userId]
            );
            query.orderBy('currencies.id', 'asc');
        }

        return query
            .then((currencies) => {
                return currencies;
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * Get currencies by expense
     * @param userId
     * @param expenseId
     * @returns {Object}
     */
    static getCurrenciesByExpense(userId, expenseId) {
        return knex('currencies')
            .select(
                'currencies.*'
            )
            .leftJoin('expense_amounts', 'expense_amounts.currency_id', 'currencies.id')
            .leftJoin('expenses', 'expenses.id', 'expense_amounts.expense_id')
            .where('expenses.user_id', userId)
            .andWhere('expenses.id', expenseId)
            .then((currencies) => {
                return currencies;
            })
            .catch((error) => {
                throw error;
            });
    }
};
