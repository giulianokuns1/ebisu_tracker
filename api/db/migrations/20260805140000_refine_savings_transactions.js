exports.up = async function(knex) {
    await knex.schema.table('saving_transactions', function(table) {
        table.dropForeign('saving_id');
        table.integer('saving_id').unsigned().nullable().alter();
        table.foreign('saving_id').references('savings.id').onDelete('CASCADE');
        table.integer('currency_id').unsigned().nullable().after('user_id');
        table.foreign('currency_id').references('currencies.id');
    });
    const transactions = await knex('saving_transactions').select('saving_transactions.id', 'savings.currency_id').leftJoin('savings', 'saving_transactions.saving_id', 'savings.id');
    for (const transaction of transactions) if (transaction.currency_id) await knex('saving_transactions').where('id', transaction.id).update({ currency_id: transaction.currency_id });
    const legacyGoals = await knex('savings').select('savings.id').whereNull('comment').whereExists(function() { this.select(1).from('saving_transactions').whereRaw('saving_transactions.saving_id = savings.id').where('saving_transactions.comment', 'Initial balance'); });
    for (const goal of legacyGoals) {
        await knex('saving_transactions').where('saving_id', goal.id).update({ saving_id: null });
        await knex('savings').where('id', goal.id).del();
    }
};
exports.down = function() { return Promise.resolve(); };
