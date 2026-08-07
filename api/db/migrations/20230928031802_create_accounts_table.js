/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('accounts', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned();
        table.string('name').nullable();
        table.string('account_number').nullable();
        table.timestamps(true, true);
        table.foreign('user_id').references('users.id');
    })
    .then(function () {
        return knex.schema.table('savings', function (table) {
            table.integer('account_id').unsigned().after('name');
            table.foreign('account_id').references('accounts.id');
        })
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('savings', function (table) {
        table.dropForeign('account_id');
        table.dropColumn('account_id');
    })
    .then(function () {
        return knex.schema.dropTable('accounts');
    });
};
