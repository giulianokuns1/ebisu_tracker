/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('budgets_type').insert([
    { name: 'Weekly' },
    { name: 'Monthly' },
    { name: 'Yearly' }
  ]);
};
