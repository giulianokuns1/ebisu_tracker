exports.up = async function(knex) {
    await knex.schema.table('savings', function(table) {
        table.decimal('target_amount', 14, 2).nullable().after('amount');
        table.integer('currency_id').unsigned().nullable().after('target_amount');
        table.text('comment').nullable().after('currency_id');
    });
    await knex('savings').update({ target_amount: knex.raw('amount') });
    await knex.schema.createTable('saving_transactions', function(table) {
        table.increments('id').primary();
        table.integer('saving_id').unsigned().notNullable();
        table.integer('user_id').unsigned().notNullable();
        table.decimal('amount', 14, 2).notNullable();
        table.string('comment').nullable();
        table.date('transaction_date').notNullable();
        table.timestamps(true, true);
        table.foreign('saving_id').references('savings.id').onDelete('CASCADE');
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.index(['user_id', 'transaction_date']);
    });
    const legacySavings = await knex('savings').select('id', 'user_id', 'amount', 'created_at');
    const initialTransactions = legacySavings.filter((saving) => Number(saving.amount) !== 0).map((saving) => ({ saving_id: saving.id, user_id: saving.user_id, amount: saving.amount, comment: 'Initial balance', transaction_date: saving.created_at }));
    if (initialTransactions.length) await knex('saving_transactions').insert(initialTransactions);
    const hasAccountColumn = await knex.schema.hasColumn('savings', 'account_id');
    if (hasAccountColumn) {
        await knex.schema.table('savings', function(table) {
            table.dropForeign('account_id');
            table.dropColumn('account_id');
        });
    }
};

exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('saving_transactions');
    await knex.schema.table('savings', function(table) {
        table.dropColumn('comment');
        table.dropColumn('currency_id');
        table.dropColumn('target_amount');
        table.integer('account_id').unsigned().nullable();
        table.foreign('account_id').references('accounts.id');
    });
};
