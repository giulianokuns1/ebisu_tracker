exports.up = function(knex) {
    return knex.schema.alterTable('categories', function(table) {
        table.integer('position').unsigned().nullable().index();
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('categories', function(table) {
        table.dropColumn('position');
    });
};
