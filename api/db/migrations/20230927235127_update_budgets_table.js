/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('budgets_type', function (table) {
        table.increments('id').primary();
        table.string('name').nullable();
        table.timestamps(true, true);
    })
    .then(function () {
        return knex.schema.table('budgets', function (table) {
            table.integer('type_id').unsigned().after('amount');
            table.foreign('type_id').references('budgets_type.id');
        })
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('budgets', function (table) {
        table.dropForeign('type_id');
        table.dropColumn('type_id');
    })
    .then(function () {
        return knex.schema.dropTable('budgets_type');
    });
};
