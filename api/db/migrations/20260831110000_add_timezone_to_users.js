exports.up = async function(knex) {
    const hasTimezone = await knex.schema.hasColumn('users', 'timezone');
    if (!hasTimezone) {
        await knex.schema.table('users', (table) => {
            table.string('timezone', 64).notNullable().defaultTo('UTC').after('dashboard_show_next_month');
        });
    }
};

exports.down = async function(knex) {
    const hasTimezone = await knex.schema.hasColumn('users', 'timezone');
    if (hasTimezone) {
        await knex.schema.table('users', (table) => {
            table.dropColumn('timezone');
        });
    }
};
