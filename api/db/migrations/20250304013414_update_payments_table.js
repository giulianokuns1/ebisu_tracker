/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('payments', function (table) {
        table.boolean('is_credit_payment').defaultTo(false).after('amount');
        table.boolean('is_full_paid').defaultTo(false).after('is_credit_payment');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('payments', function (table) {
        table.dropColumn('is_credit_payment');
        table.dropColumn('is_full_paid');
    });
};
