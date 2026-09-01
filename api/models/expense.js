const { MONTHLY_ID } = require("./expenseType");
const knex = require('knex')(require('../knexfile'));

module.exports = class Expense {
    constructor(id) {
        this.id = id;
    }

    /**
     * Get all expenses
     * @param userId
     * @param month
     * @param year
     * @returns {Object}
     */
    static getExpenses(userId, month, year = null) {
        return knex('expenses')
            .select(
                'expenses.*',
                'categories.name as category_name',
                'categories.icon as category_icon',
                'categories.color as category_color',
                'expenses_type.name as expenses_type_name'
            )
            .where('expenses.user_id', userId)
            .where('expenses.inactive', false)
            .orderByRaw('categories.position IS NULL')
            .orderBy('categories.position')
            .orderBy('expenses.name')
            .where(function () {
                if (month !== undefined && month !== null) {
                    this.where(function () {
                        this.whereRaw('MONTH(expenses.due_date) = ?', [month]);
                        if (year !== undefined && year !== null) {
                            this.andWhereRaw('YEAR(expenses.due_date) = ?', [year]);
                        }
                    }).orWhere('expenses.type_id', MONTHLY_ID);
                }
            })
            .leftJoin('categories', 'expenses.category_id', 'categories.id')
            .leftJoin('expenses_type', 'expenses.type_id', 'expenses_type.id')
            .leftJoin('expense_amounts', 'expenses.id', 'expense_amounts.expense_id')
            .leftJoin('currencies', 'expense_amounts.currency_id', 'currencies.id')
            .select('expense_amounts.*', 'currencies.name as currency_name', 'currencies.symbol as currency_symbol')
            .then((rows) => {
                const expenses = rows.reduce((acc, row) => {
                    const expenseId = row.expense_id;
                    if (!acc[expenseId]) {
                        acc[expenseId] = {
                            id: row.expense_id,
                            user_id: row.user_id,
                            category_id: row.category_id,
                            payment_method_id: row.payment_method_id,
                            name: row.name,
                            due_date: row.due_date,
                            type_id: row.type_id,
                            inactive: row.inactive,
                            created_at: row.created_at,
                            updated_at: row.updated_at,
                            category_name: row.category_name,
                            category_icon: row.category_icon,
                            expenses_type_name: row.expenses_type_name,
                            expense_amounts: [],
                        };
                    }
                    if (row.expense_id === expenseId) {
                        acc[expenseId].expense_amounts.push({
                            id: row.id,
                            expense_id: row.expense_id,
                            currency_id: row.currency_id,
                            amount: row.amount,
                            created_at: row.expense_amounts_created_at,
                            updated_at: row.expense_amounts_updated_at,
                            currency_name: row.currency_name,
                            currency_symbol: row.currency_symbol
                        });
                    }
                    return acc;
                }, {});
                return Object.values(expenses);
            })
            .catch((error) => {
                throw error;
            });

    }

    /**
     * Get expense
     * @returns {Object}
     */
    static getExpense(userId, expenseId) {
        return knex('expenses')
            .select(
                'expenses.*',
                'categories.name as category_name',
                'categories.icon as category_icon',
                'categories.color as category_color',
                'expenses_type.name as expenses_type_name',
            )
            .where('expenses.user_id', userId)
            .andWhere('expenses.id', expenseId)
            .leftJoin('categories', 'expenses.category_id', 'categories.id')
            .leftJoin('expenses_type', 'expenses.type_id', 'expenses_type.id')
            .then((expenses) => {
                return expenses;
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * Creates a new expense
     * @param userId
     * @param data
     * @returns {*|null}
     */
    static create(userId, data) {
        data.user_id = userId;
        return knex('expenses')
            .insert(data);
    }
    /**
     * Updates an expense
     * @param id
     * @param userId
     * @param data
     * @returns {*|null}
     */
    static update(id, userId, data) {
        return knex('expenses')
            .where({
                id: id,
                user_id: userId
            })
            .update(data);
    }
    /**
     * Deletes an expense
     * @param id
     * @param userId
     */
    static deleteExpense(id, userId) {
        return knex('expenses')
            .where({
                id: id,
                user_id: userId
            })
            .del();
    }

    /**
     * Get all expenses
     * @param userId
     * @param categoryId
     * @returns {Object}
     */
    static getExpensesByCategory(userId, categoryId) {
        return knex('expenses')
            .select(
                'expenses.*'
            )
            .where('expenses.category_id', categoryId)
            .then((expenses) => {
                return expenses;
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Get the expense amount for a specific expense id
     * @param userId
     * @param expenseId
     * @return {Object}
     */
    static getExpenseAmount(userId, expenseId) {
        return knex('expense_amounts')
            .select(
                '*'
            )
            .where('expense_id', expenseId)
            .then((expenseAmount) => {
                return expenseAmount;
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * Get the expense amount by expense id
     * @param userId
     * @param expenseId
     * @return {Object}
     */
    static getExpenseAmountByExpense(userId, expenseId) {
        return knex('expense_amounts')
            .select(
                'expense_amounts.*',
                'currencies.symbol as currency_symbol',
                'currencies.name as currency_name'
            )
            .where('expenses.user_id', userId)
            .andWhere('expense_amounts.expense_id', expenseId)
            .leftJoin('expenses', 'expense_amounts.expense_id', 'expenses.id')
            .leftJoin('currencies', 'expense_amounts.currency_id', 'currencies.id')
            .then((expenseAmount) => {
                return expenseAmount;
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * Creates a new expense amount
     * @param data
     * @returns {*|null}
     */
    static newExpenseAmount(data) {
        return knex('expense_amounts').insert(data);
    }
    /**
     * Creates a new expense amount
     * @param id
     * @param data
     * @return {Knex.QueryBuilder<TRecord, number>}
     */
    static updateExpenseAmount(id, data) {
        return knex('expense_amounts')
            .where({
                id: id,
            })
            .update(data);
    }
    /**
     * Deletes an expense amount
     * @param id
     */
    static deleteExpenseAmount(id) {
        return knex('expense_amounts')
            .where({
                id: id
            })
            .del();
    }
    /**
     * Deletes an expense amount by expense
     * @param userId
     * @param expenseId
     * @return {Object}
     */
    static deleteExpenseAmountByExpense(userId, expenseId) {
        return knex('expense_amounts')
            .where('expenses.user_id', userId)
            .andWhere('expense_amounts.expense_id', expenseId)
            .leftJoin('expenses', 'expense_amounts.expense_id', 'expenses.id')
            .del()
            .then((expenseAmount) => {
                return expenseAmount;
            })
            .catch((error) => {
                throw error;
            });
    }

    /**
     * Get all expenses by expense amount. One line per expense amount.
     * @param userId
     * @param month
     * @returns {Promise<Array>}
     */
    static getExpensesByAmount(userId, month, year) {
        return knex('expenses')
            .select(
                'expenses.*',
                'categories.name as category_name',
                'categories.icon as category_icon',
                'categories.color as category_color',
                'expenses_type.name as expenses_type_name',
                'expense_amounts.id as expense_amount_id',
                'expense_amounts.amount as amount',
                'expense_amounts.currency_id as currency_id',
                'currencies.name as currency_name',
                'currencies.symbol as currency_symbol',
                'expense_amount_schedule.amount as expense_amount_schedule_amount'
            )
            .where('expenses.user_id', userId)
            .where('expenses.inactive', false)
            .where(function () {
                if (month !== undefined && month !== null) {
                    this.whereRaw('MONTH(expenses.due_date) = ?', [month]);
                    this.orWhere('expenses.type_id', MONTHLY_ID);
                    this.orWhere(function () {
                        this.whereExists(function () {
                            this.select(1)
                                .from('expense_schedule')
                                .whereRaw('expense_schedule.expense_id = expenses.id')
                                .whereRaw('expense_schedule.month = ?', [month])
                        });
                    });
                }
            })
            .leftJoin('categories', 'expenses.category_id', 'categories.id')
            .leftJoin('expenses_type', 'expenses.type_id', 'expenses_type.id')
            .leftJoin('expense_amounts', 'expenses.id', 'expense_amounts.expense_id')
            .leftJoin('currencies', 'expense_amounts.currency_id', 'currencies.id')
            .leftJoin('expense_amount_schedule', function () {
                this.on('expense_amounts.id', '=', 'expense_amount_schedule.expense_amount_id');
                if (month !== undefined && month !== null) {
                    this.on('expense_amount_schedule.month', '=', knex.raw('?', [month]));
                    if (year !== undefined && year !== null) {
                        this.on('expense_amount_schedule.year', '=', knex.raw('?', [year]));
                    }
                }
            })
            .catch((error) => {
                throw error;
            });
    }

};
