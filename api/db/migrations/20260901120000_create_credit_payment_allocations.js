exports.up = async function(knex) {
    await knex.schema.createTable('credit_payment_allocations', function(table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.integer('payment_id').unsigned().notNullable();
        table.integer('expense_amount_id').unsigned().notNullable();
        table.decimal('amount', 14, 2).notNullable();
        table.timestamps(true, true);
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.foreign('payment_id').references('payments.id').onDelete('CASCADE');
        table.foreign('expense_amount_id').references('expense_amounts.id').onDelete('CASCADE');
        table.unique(['payment_id', 'expense_amount_id']);
    });

    // Allocations are intentional user choices. Do not infer them from historical
    // statement payments because those payments cannot be reliably matched to purchases.
};

exports.down = function(knex) {
    return knex.schema.dropTable('credit_payment_allocations');
};
