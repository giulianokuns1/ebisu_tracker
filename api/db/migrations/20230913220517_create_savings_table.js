/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('savings', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned();
        table.string('name');
        table.decimal('amount');
        table.timestamps(true, true);
        table.foreign('user_id').references('users.id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('savings');
};
