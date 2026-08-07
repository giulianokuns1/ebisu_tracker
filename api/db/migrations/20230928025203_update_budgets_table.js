/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('budgets', function (table) {
        table.integer('currency_id').unsigned().after('amount');
        table.foreign('currency_id').references('currencies.id');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('budgets', function (table) {
        table.dropForeign('currency_id');
        table.dropColumn('currency_id');
    });
};
