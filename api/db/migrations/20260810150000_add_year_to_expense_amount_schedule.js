exports.up = async function(knex) {
    const hasYear = await knex.schema.hasColumn('expense_amount_schedule', 'year');
    if (!hasYear) {
        await knex.schema.table('expense_amount_schedule', (table) => {
            table.integer('year').nullable().after('month');
        });
    }

    await knex('expense_amount_schedule').whereNull('year').update({ year: new Date().getFullYear() });

    await knex.schema.table('expense_amount_schedule', (table) => {
        table.integer('year').notNullable().alter();
        table.unique(['expense_amount_id', 'year', 'month'], 'expense_amount_schedule_amount_year_month_unique');
        table.index(['user_id', 'year', 'month'], 'expense_amount_schedule_user_year_month_index');
    });
};

exports.down = async function(knex) {
    await knex.schema.table('expense_amount_schedule', (table) => {
        table.dropIndex(['user_id', 'year', 'month'], 'expense_amount_schedule_user_year_month_index');
        table.dropUnique(['expense_amount_id', 'year', 'month'], 'expense_amount_schedule_amount_year_month_unique');
        table.dropColumn('year');
    });
};
