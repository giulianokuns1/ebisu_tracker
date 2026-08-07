const knex = require('knex')(require('../knexfile'));
module.exports = class ExpenseSchedule {
    constructor(id) {
        this.id = id;
    }
    /**
     * Get all expenses schedule
     * @returns {Object}
     */
    static get(expenseId) {
        return knex('expense_schedule')
            .select()
            .where('expense_id', expenseId)
            .then((expenseSchedule) => {
                return expenseSchedule;
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * Create new expenses schedule
     * @returns {Object}
     */
    static create(lines) {
        return knex('expense_schedule')
            .insert(lines)
            .then((expenseSchedule) => {
                return expenseSchedule;
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Deletes all expenses schedule by expense id
     * @param expenseId
     */
    static delete(expenseId) {
        return knex('expense_schedule')
            .where({
                expense_id: expenseId
            })
            .del()
            .catch(error => {
                console.error('Error deleting expense schedule:', error);
                throw error;
            });
    }
};
