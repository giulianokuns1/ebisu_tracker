/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('expenses', function (table) {
        table.integer('due_date_day').nullable().after('due_date');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('expenses', function (table) {
        table.dropColumn('due_date_day');
    });
};
