const knex = require('knex')(require('../knexfile'));

module.exports = class Category {
    constructor(id, user_id, name, icon, created_at, updated_at) {
        this.id = id;
        this.user_id = user_id;
        this.name = name;
        this.icon = icon;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
    /**
     * Get all categories
     * @returns {Object}
     */
    static getCategories(user_id) {
        return knex('categories')
            .select()
            .where('user_id', user_id)
            .orderByRaw('position IS NULL')
            .orderBy('position')
            .orderBy('name')
            .then((categories) => {
                return categories;
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Get category by id
     * @param id
     * @returns {Object}
     */
    static getCategory(id) {
        return knex('categories')
            .where('id', id)
            .then((categories) => {
                return categories;
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * Creates a new category
     * @param user_id
     * @param name
     * @param icon
     * @returns {*|null}
     */
    static newCategory(user_id, name, icon, color) {
        return knex('categories')
            .insert({
                user_id: user_id,
                name: name,
                icon: icon,
                color
            });
    }

    static async updateOrder(userId, categoryIds) {
        await knex.transaction(async (trx) => {
            for (const [position, id] of categoryIds.entries()) {
                await trx('categories').where({ id, user_id: userId }).update({ position });
            }
        });
    }
    /**
     * Deletes a category
     * @param id
     * @param userId
     */
    static deleteCategory(id, userId) {
        return knex('categories')
            .where({
                id: id,
                user_id: userId
            })
            .del();
    }
    /**
     * Updates a category
     * @param id
     * @param userId
     * @param name
     * @param icon
     * @returns {*|null}
     */
    static updateCategory(id, userId, name, icon, color) {
        return knex('categories')
            .where({
                id: id,
                user_id: userId
            })
            .update({
                name: name,
                icon: icon,
                color
            });
    }

    /**
     * Get category by payment method id
     * @param paymentMethodId
     * @returns {Object}
     */
    static getCategoryByPaymentMethodId(paymentMethodId) {
        return knex('categories')
            .select('categories.*')
            .join('expenses', 'categories.id', '=', 'expenses.category_id')
            .join('payment_methods', 'expenses.id', '=', 'payment_methods.expense_id')
            .where('payment_methods.id', paymentMethodId)
            .then((categories) => {
                return categories;
            })
            .catch((error) => {
                throw error;
            });
    }
};
