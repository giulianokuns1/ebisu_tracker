/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('payment_methods', function (table) {
        table.string('statement_date_day').nullable().after('due_date_day');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('payment_methods', function (table) {
        table.dropColumn('statement_date_day');
    })
};
