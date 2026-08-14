exports.up = function(knex) {
    return knex.schema.createTable('password_reset_codes', function(table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.string('code_hash').notNullable();
        table.timestamp('expires_at').notNullable();
        table.integer('attempts').unsigned().notNullable().defaultTo(0);
        table.timestamp('used_at').nullable();
        table.timestamps(true, true);

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.index(['user_id', 'used_at', 'expires_at']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('password_reset_codes');
};
