/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('wizard_categories').del();
  await knex('wizard_categories').insert([
    { name: 'House', icon: 'bi-house', sort_order: 1 },
    { name: 'Food', icon: 'bi-basket', sort_order: 2 },
    { name: 'Commute', icon: 'bi-car-front', sort_order: 3 },
    { name: 'Bank', icon: 'bi-bank', sort_order: 4 },
    { name: 'Healthy and Sports', icon: 'bi-heart-pulse', sort_order: 5 },
    { name: 'Company', icon: 'bi-building', sort_order: 6 },
    { name: 'Work', icon: 'bi-briefcase', sort_order: 7 },
    { name: 'Others', icon: 'bi-three-dots', sort_order: 8 },
    { name: 'Subscriptions', icon: 'bi-credit-card', sort_order: 9 }
  ]);
};
