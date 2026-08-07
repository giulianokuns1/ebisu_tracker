const knex = require('knex')(require('../knexfile'));

module.exports = class Bill {
    constructor(id) {
        this.id = id;
    }
    /**
     * Get all bills
     * @returns {Object}
     */
    static getBills(user_id) {
        return knex('bills')
            .select()
            .where('user_id', user_id)
            .then((bills) => {
                return bills;
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * Delete by category
     * @param userId
     * @param categoryId
     */
    static deleteByCategory(userId, categoryId) {
        return knex('bills')
            .where({
                user_id: userId,
                category_id: categoryId
            })
            .del();
    }
};
