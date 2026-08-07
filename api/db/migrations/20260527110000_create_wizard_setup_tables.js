/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .table('users', function (table) {
            table.boolean('wizard_completed').notNullable().defaultTo(false).after('default_currency_id');
        })
        .createTable('user_currencies', function (table) {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable();
            table.integer('currency_id').unsigned().notNullable();
            table.boolean('created_from_wizard').notNullable().defaultTo(false);
            table.timestamps(true, true);
            table.unique(['user_id', 'currency_id']);
            table.foreign('user_id').references('users.id');
            table.foreign('currency_id').references('currencies.id');
        })
        .createTable('wizard_categories', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('icon').nullable();
            table.boolean('active').notNullable().defaultTo(true);
            table.integer('sort_order').notNullable().defaultTo(0);
            table.timestamps(true, true);
        })
        .createTable('wizard_expenses', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('default_category_name').nullable();
            table.boolean('active').notNullable().defaultTo(true);
            table.integer('sort_order').notNullable().defaultTo(0);
            table.timestamps(true, true);
        })
        .createTable('wizard_payment_methods', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.boolean('is_credit').notNullable().defaultTo(false);
            table.boolean('active').notNullable().defaultTo(true);
            table.integer('sort_order').notNullable().defaultTo(0);
            table.timestamps(true, true);
        })
        .table('categories', function (table) {
            table.boolean('created_from_wizard').notNullable().defaultTo(false).after('icon');
        })
        .table('expenses', function (table) {
            table.boolean('created_from_wizard').notNullable().defaultTo(false).after('inactive');
        })
        .table('payment_methods', function (table) {
            table.boolean('created_from_wizard').notNullable().defaultTo(false).after('is_default');
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .table('payment_methods', function (table) {
            table.dropColumn('created_from_wizard');
        })
        .table('expenses', function (table) {
            table.dropColumn('created_from_wizard');
        })
        .table('categories', function (table) {
            table.dropColumn('created_from_wizard');
        })
        .dropTable('wizard_payment_methods')
        .dropTable('wizard_expenses')
        .dropTable('wizard_categories')
        .dropTable('user_currencies')
        .table('users', function (table) {
            table.dropColumn('wizard_completed');
        });
};
