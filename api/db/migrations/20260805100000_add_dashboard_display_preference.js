exports.up = function(knex) {
    return knex.schema.table('users', function(table) {
        table.boolean('dashboard_show_next_month').notNullable().defaultTo(true).after('default_currency_id');
    });
};

exports.down = function(knex) {
    return knex.schema.table('users', function(table) {
        table.dropColumn('dashboard_show_next_month');
    });
};
