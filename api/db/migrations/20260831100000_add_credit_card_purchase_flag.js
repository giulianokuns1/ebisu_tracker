exports.up = function(knex) {
    return knex.schema.table('expenses', function(table) {
        table.boolean('is_credit_card_purchase').notNullable().defaultTo(false).after('payment_method_id');
    });
};

exports.down = function(knex) {
    return knex.schema.table('expenses', function(table) {
        table.dropColumn('is_credit_card_purchase');
    });
};
