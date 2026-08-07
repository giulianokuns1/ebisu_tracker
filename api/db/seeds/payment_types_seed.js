/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('payments_type').insert([
    { name: 'Debit' },
    { name: 'Credit' },
    { name: 'Transfer' },
    { name: 'Cash' }
  ]);
};
