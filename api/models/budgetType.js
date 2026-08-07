const knex = require('knex')(require('../knexfile'));
module.exports = class BudgetType {
    constructor(id) {
        this.id = id;
    }
    /**
     * Get all budgets types
     * @returns {Object}
     */
    static getBudgetsType() {
        return knex('budgets_type')
            .select()
            .then((budgetsTypes) => {
                return budgetsTypes;
            })
            .catch((error) => {
                throw error;
            });
    }
};
