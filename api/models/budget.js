const knex = require('knex')(require('../knexfile'));

module.exports = class Budget {
    constructor(id) {
        this.id = id;
    }
    /**
     * Get all budgets
     * @returns {Object}
     */
    static getBudgets(userId) {
        return knex('budgets')
            .select(
                'budgets.*',
                'categories.name as category_name',
                'categories.icon as category_icon',
                'currencies.name as currency_name',
                'currencies.symbol as currency_symbol',
                'budgets_type.name as budgets_type_name',
            )
            .where('budgets.user_id', userId)
            .leftJoin('categories', 'budgets.category_id', 'categories.id')
            .leftJoin('currencies', 'budgets.currency_id', 'currencies.id')
            .leftJoin('budgets_type', 'budgets.type_id', 'budgets_type.id')
            .then((budgets) => {
                return budgets;
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * Get budget
     * @returns {Object}
     */
    static getBudget(userId, budgetId) {
        return knex('budgets')
            .select(
                'budgets.*',
                'categories.name as category_name',
                'categories.icon as category_icon',
                'currencies.name as currency_name',
                'currencies.symbol as currency_symbol',
                'budgets_type.name as budgets_type_name',
            )
            .where('budgets.user_id', userId)
            .andWhere('budgets.id', budgetId)
            .leftJoin('categories', 'budgets.category_id', 'categories.id')
            .leftJoin('currencies', 'budgets.currency_id', 'currencies.id')
            .leftJoin('budgets_type', 'budgets.type_id', 'budgets_type.id')
            .then((budgets) => {
                return budgets;
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * Creates a new budget
     * @param userId
     * @param name
     * @param amount
     * @param currency
     * @param category
     * @param budgetType
     * @returns {*|null}
     */
    static newBudget(userId, name, amount, currency, category, budgetType) {
        return knex('budgets')
            .insert({
                user_id: userId,
                name: name,
                amount: amount,
                currency_id: currency,
                category_id: category,
                type_id: budgetType
            });
    }
    /**
     * Updates an budget
     * @param id
     * @param userId
     * @param name
     * @param amount
     * @param currency
     * @param category
     * @param budgetType
     * @returns {*|null}
     */
    static updateBudget(id, userId, name, amount, currency, category, budgetType) {
        return knex('budgets')
            .where({
                id: id,
                user_id: userId
            })
            .update({
                name: name,
                amount: amount,
                currency_id: currency,
                category_id: category,
                type_id: budgetType
            });
    }
    /**
     * Deletes a budget
     * @param id
     * @param userId
     */
    static deleteBudget(id, userId) {
        return knex('budgets')
            .where({
                id: id,
                user_id: userId
            })
            .del();
    }
    /**
     * Deletes by category
     * @param userId
     * @param categoryId
     */
    static deleteByCategory(userId, categoryId) {
        return knex('budgets')
            .where({
                user_id: userId,
                category_id: categoryId
            })
            .del();
    }
};
