/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('expense_schedule', function (table) {
        table.integer('expense_id').unsigned();
        table.string('month').nullable();
        table.foreign('expense_id').references('expenses.id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('expense_schedule');
};
