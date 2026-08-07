/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('currencies', function (table) {
        table.increments('id').primary();
        table.string('name').nullable();
        table.string('symbol').nullable();
        table.timestamps(true, true);
    })
        .then(function () {
            return knex.schema.createTable('payments_type', function (table) {
                table.increments('id').primary();
                table.string('name').nullable();
                table.timestamps(true, true);
            });
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('currencies')
        .then(function () {
            return knex.schema.dropTable('payments_type');
        });
};

