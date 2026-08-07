const knex = require('knex')(require('../knexfile'));
module.exports = class Expense {
    constructor(id) {
        this.id = id;
    }
    /**
     * Get all expenses types
     * @returns {Object}
     */
    static getExpensesType() {
        return knex('expenses_type')
            .select()
            .orderBy('order')
            .then((expensesTypes) => {
                return expensesTypes;
            })
            .catch((error) => {
                throw error;
            });
    }
};

module.exports.ONCE_ID = 1;
module.exports.SCHEDULED_ID = 2;
module.exports.MONTHLY_ID = 3;
module.exports.YEARLY_ID = 4;
