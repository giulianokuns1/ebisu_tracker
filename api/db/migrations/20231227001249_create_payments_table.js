/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('payment_methods', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned();
        table.integer('expense_id').unsigned();
        table.boolean('is_credit');
        table.string('name').nullable();
        table.string('description').nullable();
        table.string('due_date_day').nullable();
        table.timestamps(true, true);
        table.foreign('user_id').references('users.id');
        table.foreign('expense_id').references('expenses.id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('payment_methods');
};
