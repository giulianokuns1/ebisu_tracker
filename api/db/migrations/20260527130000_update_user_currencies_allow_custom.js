/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('user_currencies', function (table) {
        table.integer('currency_id').unsigned().nullable().alter();
        table.string('custom_name').nullable().after('currency_id');
        table.string('custom_symbol').nullable().after('custom_name');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('user_currencies', function (table) {
        table.dropColumn('custom_symbol');
        table.dropColumn('custom_name');
    });
};
