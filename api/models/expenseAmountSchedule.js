const knex = require('knex')(require('../knexfile'));

module.exports = class ExpenseAmountSchedule {
    constructor(id) {
        this.id = id;
    }

    /**
     * Get all expense amount schedules by expense amount id
     * @param {Number} expenseAmountId
     * @returns {Object}
     */
    static get(expenseAmountId) {
        return knex('expense_amount_schedule')
            .select()
            .where('expense_amount_id', expenseAmountId)
            .then((expenseAmountSchedule) => {
                return expenseAmountSchedule;
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Get expense amount schedule by expense amount id and month
     * @param {Number} expenseAmountId
     * @param {String} month
     * @returns {Object}
     */
    static getByMonth(expenseAmountId, month) {
        return knex('expense_amount_schedule')
            .select()
            .where('expense_amount_id', expenseAmountId)
            .where('month', month)
            .then((expenseAmountSchedule) => {
                return expenseAmountSchedule;
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Create new expense amount schedules
     * @param {Array} lines - Array of schedule entries with expense_amount_id, amount, and month
     * @returns {Object}
     */
    static create(lines) {
        return knex('expense_amount_schedule')
            .insert(lines)
            .then((expenseAmountSchedule) => {
                return expenseAmountSchedule;
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Deletes all expense amount schedules by expense amount id
     * @param {Number} expenseAmountId
     */
    static delete(expenseAmountId) {
        return knex('expense_amount_schedule')
            .where({
                expense_amount_id: expenseAmountId
            })
            .del()
            .catch(error => {
                console.error('Error deleting expense amount schedule:', error);
                throw error;
            });
    }

    /**
     * Deletes expense amount schedule by expense amount id and month
     * @param {Number} expenseAmountId
     * @param {String} month
     */
    static deleteByMonth(expenseAmountId, month) {
        return knex('expense_amount_schedule')
            .where({
                expense_amount_id: expenseAmountId,
                month: month
            })
            .del()
            .catch(error => {
                console.error('Error deleting expense amount schedule by month:', error);
                throw error;
            });
    }

    /**
     * Update or create expense amount schedule by expense amount id and month
     * If record exists, updates the amount. If not, creates a new record.
     * @param {Number} userId
     * @param {Number} expenseAmountId
     * @param {String} month
     * @param {Number} amount
     * @returns {Object}
     */
    static upsert(userId, expenseAmountId, month, amount) {
        return knex('expense_amount_schedule')
            .where({
                expense_amount_id: expenseAmountId,
                user_id: userId,
                month: month
            })
            .first()
            .then((existingRecord) => {
                if (existingRecord) {
                    // Update existing record
                    return knex('expense_amount_schedule')
                        .where({
                            expense_amount_id: expenseAmountId,
                            user_id: userId,
                            month: month
                        })
                        .update({
                            amount: amount
                        })
                        .then(() => {
                            // Return the updated record
                            return knex('expense_amount_schedule')
                                .where({
                                    expense_amount_id: expenseAmountId,
                                    user_id: userId,
                                    month: month
                                })
                                .first();
                        });
                } else {
                    // Create new record
                    return knex('expense_amount_schedule')
                        .insert({
                            expense_amount_id: expenseAmountId,
                            user_id: userId,
                            month: month,
                            amount: amount
                        })
                        .then((insertedIds) => {
                            return knex('expense_amount_schedule')
                                .where('id', insertedIds[0])
                                .first();
                        });
                }
            })
            .catch((error) => {
                console.error('Error upserting expense amount schedule:', error);
                throw error;
            });
    }
    static getByMonth(expenseAmountId, month) {
        return knex('expense_amount_schedule')
            .select()
            .where('expense_amount_id', expenseAmountId)
            .where('month', month)
            .then((expenseAmountSchedule) => {
                return expenseAmountSchedule;
            })
            .catch((error) => {
                throw error;
            });
    }
    static getByUserId(userId, month) {
        return knex('expense_amount_schedule')
            .select()
            .where('user_id', userId)
            .where('month', month)
            .then((expenseAmountSchedule) => {
                return expenseAmountSchedule;
            })
            .catch((error) => {
                throw error;
            });
    }
};

