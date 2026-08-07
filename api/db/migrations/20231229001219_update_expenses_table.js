/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('expenses', function (table) {
        table.integer('payment_method_id').unsigned().after('category_id');
        table.foreign('payment_method_id').references('payment_methods.id');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
       return knex.schema.table('expenses', function (table) {
            table.dropForeign('payment_method_id');
            table.dropColumn('payment_method_id');
        })
};
