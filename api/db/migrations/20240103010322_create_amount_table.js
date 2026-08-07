/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('expense_amounts', function (table) {
        table.increments('id').primary();
        table.integer('expense_id').unsigned();
        table.integer('currency_id').unsigned();
        table.decimal('amount').nullable();
        table.foreign('expense_id').references('expenses.id');
        table.foreign('currency_id').references('currencies.id');
        table.timestamps(true, true);
    })
        .then(function () {
            return knex.schema.table('payments', function (table) {
                table.integer('expense_amount_id').unsigned().after('user_id');
                table.foreign('expense_amount_id').references('expense_amounts.id');
            });
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('payments', function (table) {
        table.dropForeign('expense_amount_id');
        table.dropColumn('expense_amount_id');
    })
        .then(function () {
            return knex.schema.dropTable('expense_amounts');
        });
};

