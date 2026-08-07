/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('bills', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned();
        table.integer('category_id').unsigned();
        table.string('name').nullable();
        table.decimal('amount').nullable();
        table.specificType('document_data', 'mediumblob').nullable();
        table.string('document_name').nullable();
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
    return knex.schema.dropTable('bills');
};
