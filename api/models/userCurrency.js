const knex = require('knex')(require('../knexfile'));

module.exports = class UserCurrency {
    static getUserCurrencies(userId) {
        return knex('user_currencies')
            .select('user_currencies.*', 'currencies.name as currency_name', 'currencies.symbol as currency_symbol')
            .leftJoin('currencies', 'currencies.id', 'user_currencies.currency_id')
            .where('user_currencies.user_id', userId)
            .orderBy('user_currencies.id', 'asc');
    }

    static getUserCurrency(userId, id) {
        return knex('user_currencies').where({ user_id: userId, id }).first();
    }

    static create(data) {
        return knex('user_currencies').insert(data);
    }

    static update(userId, id, data) {
        return knex('user_currencies').where({ user_id: userId, id }).update(data);
    }

    static remove(userId, id) {
        return knex('user_currencies').where({ user_id: userId, id }).del();
    }
};
