/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('expenses', function (table) {
        table.integer('type_id').unsigned().after('due_date');
        table.foreign('type_id').references('expenses_type.id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('expenses', function (table) {
        table.dropForeign('type_id');
        table.dropColumn('type_id');
    });
};
