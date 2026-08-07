/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('wizard_payment_methods').del();
  await knex('wizard_payment_methods').insert([
    { name: 'Cash', is_credit: false, sort_order: 1 },
    { name: 'Credit Card', is_credit: true, sort_order: 2 },
    { name: 'Debit Card', is_credit: false, sort_order: 3 },
    { name: 'Transfer', is_credit: false, sort_order: 4 }
  ]);
};
