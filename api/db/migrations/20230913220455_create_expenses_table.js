/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('expenses', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned();
        table.integer('category_id').unsigned().nullable();
        table.string('name');
        table.datetime('due_date').nullable();
        table.timestamps(true, true);
        table.foreign('user_id').references('users.id');
        table.foreign('category_id').references('categories.id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('expenses');
};
