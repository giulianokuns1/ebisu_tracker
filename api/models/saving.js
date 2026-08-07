const knex = require('knex')(require('../knexfile'));

module.exports = class Saving {
    static getGoals(userId) {
        return knex('savings').select('savings.*', 'currencies.name as currency_name', 'currencies.symbol as currency_symbol')
            .where('savings.user_id', userId).leftJoin('currencies', 'savings.currency_id', 'currencies.id').orderBy('savings.created_at', 'desc');
    }
    static getGoal(userId, savingId) { return this.getGoals(userId).andWhere('savings.id', savingId).first(); }
    static getTransactions(userId, startDate, endDate, savingId) {
        const query = knex('saving_transactions').select('saving_transactions.*', 'savings.name as saving_name', 'currencies.symbol as currency_symbol')
            .where('saving_transactions.user_id', userId).leftJoin('savings', 'saving_transactions.saving_id', 'savings.id').leftJoin('currencies', 'saving_transactions.currency_id', 'currencies.id').orderBy('transaction_date', 'desc');
        if (startDate) query.where('transaction_date', '>=', startDate);
        if (endDate) query.where('transaction_date', '<=', endDate);
        if (savingId) query.where('saving_transactions.saving_id', savingId);
        return query;
    }
    static createGoal(userId, { name, targetAmount, currencyId, comment }) { return knex('savings').insert({ user_id: userId, name, amount: 0, target_amount: targetAmount, currency_id: currencyId || null, comment }); }
    static updateGoal(id, userId, { name, targetAmount, currencyId, comment }) { return knex('savings').where({ id, user_id: userId }).update({ name, target_amount: targetAmount, currency_id: currencyId || null, comment }); }
    static createTransaction(userId, { savingId, currencyId, amount, comment, transactionDate }) { return knex('saving_transactions').insert({ saving_id: savingId || null, user_id: userId, currency_id: currencyId, amount, comment, transaction_date: transactionDate }); }
    static updateTransaction(id, userId, { savingId, currencyId, amount, comment, transactionDate }) { return knex('saving_transactions').where({ id, user_id: userId }).update({ saving_id: savingId || null, currency_id: currencyId, amount, comment, transaction_date: transactionDate }); }
    static deleteTransaction(id, userId) { return knex('saving_transactions').where({ id, user_id: userId }).del(); }
    static deleteSaving(id, userId) { return knex('savings').where({ id, user_id: userId }).del(); }
};
