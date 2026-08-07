exports.up = function(knex) {
    return knex.schema.createTable('income_transactions', function(table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.integer('account_id').unsigned().nullable();
        table.integer('currency_id').unsigned().notNullable();
        table.string('source').notNullable();
        table.decimal('amount', 14, 2).notNullable();
        table.date('received_at').notNullable();
        table.string('note').nullable();
        table.timestamps(true, true);
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.foreign('account_id').references('accounts.id').onDelete('SET NULL');
        table.foreign('currency_id').references('currencies.id');
        table.index(['user_id', 'currency_id', 'received_at']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('income_transactions');
};
