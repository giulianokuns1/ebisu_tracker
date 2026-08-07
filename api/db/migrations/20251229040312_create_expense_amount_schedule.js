/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('expense_amount_schedule', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned();
        table.integer('expense_amount_id').unsigned();
        table.decimal('amount').nullable();
        table.string('month').nullable();
        table.foreign('expense_amount_id').references('expense_amounts.id');
        table.foreign('user_id').references('users.id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('expense_amount_schedule');
};
