/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
    await knex('expenses_type').insert([
        { name: 'Once' },
        { name: 'Scheduled' },
        { name: 'Monthly' },
        { name: 'Yearly' }
    ]);
};
