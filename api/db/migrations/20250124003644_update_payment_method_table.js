/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('payment_methods', function (table) {
        table.integer('payment_type_id').unsigned().after('expense_id');
        table.foreign('payment_type_id').references('payments_type.id');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('payment_methods', function (table) {
        table.dropForeign('payment_type_id');
        table.dropColumn('payment_type_id');
    })
};
