/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('payment_methods', function (table) {
        table.boolean('is_default').notNullable().defaultTo(false).after('payment_type_id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('payment_methods', function (table) {
        table.dropColumn('is_default');
    });
};
