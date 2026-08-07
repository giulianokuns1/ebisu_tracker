/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('users', function (table) {
        table.integer('default_currency_id').unsigned().nullable().after('google_token');
        table.foreign('default_currency_id').references('currencies.id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('users', function (table) {
        table.dropForeign('default_currency_id');
        table.dropColumn('default_currency_id');
    });
};
