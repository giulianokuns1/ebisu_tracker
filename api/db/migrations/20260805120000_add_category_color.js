exports.up = function(knex) {
    return knex.schema.table('categories', function(table) {
        table.string('color', 7).notNullable().defaultTo('#4FD6BE').after('icon');
    });
};

exports.down = function(knex) {
    return knex.schema.table('categories', function(table) {
        table.dropColumn('color');
    });
};
