const knex = require('knex')(require('../knexfile'));

module.exports = class Account {
    constructor(id) {
        this.id = id;
    }
    /**
     * Get all accounts
     * @returns {Object}
     */
    static getAccounts(userId) {
        return knex('accounts')
            .select('*')
            .where('user_id', userId)
            .then((accounts) => {
                return accounts;
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * Get account
     * @returns {Object}
     */
    static getAccount(userId, accountId) {
        return knex('accounts')
            .select('*')
            .where('user_id', userId)
            .andWhere('id', accountId)
            .then((accounts) => {
                return accounts;
            })
            .catch((error) => {
                throw error;
            });
    }
    /**
     * Creates a new account
     * @param userId
     * @param name
     * @param accountNumber
     * @returns {*|null}
     */
    static newAccount(userId, name, accountNumber) {
        return knex('accounts')
            .insert({
                user_id: userId,
                name: name,
                account_number: accountNumber
            });
    }
    /**
     * Updates an account
     * @param id
     * @param userId
     * @param name
     * @param accountNumber
     * @returns {*|null}
     */
    static updateAccount(id, userId, name, accountNumber) {
        return knex('accounts')
            .where({
                id: id,
                user_id: userId
            })
            .update({
                name: name,
                account_number: accountNumber
            });
    }
    /**
     * Deletes an account
     * @param id
     * @param userId
     */
    static deleteAccount(id, userId) {
        return knex('accounts')
            .where({
                id: id,
                user_id: userId
            })
            .del();
    }

};
