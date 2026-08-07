/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('wizard_expenses').del();
  await knex('wizard_expenses').insert([
    { name: 'Rent', default_category_name: 'House', sort_order: 1 },
    { name: 'Common Expenses', default_category_name: 'House', sort_order: 2 },
    { name: 'House Taxes', default_category_name: 'House', sort_order: 3 },
    { name: 'Electricity', default_category_name: 'House', sort_order: 4 },
    { name: 'Gas', default_category_name: 'House', sort_order: 5 },
    { name: 'Internet', default_category_name: 'House', sort_order: 6 },
    { name: 'Phone', default_category_name: 'House', sort_order: 7 },
    { name: 'Cleaning Service', default_category_name: 'House', sort_order: 8 },
    { name: 'Fuel', default_category_name: 'Commute', sort_order: 9 },
    { name: 'Bus', default_category_name: 'Commute', sort_order: 10 },
    { name: 'Car Insurance', default_category_name: 'Commute', sort_order: 11 },
    { name: 'Car Service', default_category_name: 'Commute', sort_order: 12 },
    { name: 'House Insurance', default_category_name: 'House', sort_order: 13 },
    { name: 'Gym', default_category_name: 'Healthy and Sports', sort_order: 14 },
    { name: 'Dentist', default_category_name: 'Healthy and Sports', sort_order: 15 },
    { name: 'Club', default_category_name: 'Healthy and Sports', sort_order: 16 },
    { name: 'Car Loan', default_category_name: 'Bank', sort_order: 17 },
    { name: 'Loan', default_category_name: 'Bank', sort_order: 18 },
    { name: 'Medical Service', default_category_name: 'Healthy and Sports', sort_order: 19 },
    { name: 'Taxes', default_category_name: 'Company', sort_order: 20 },
    { name: 'Accountant', default_category_name: 'Company', sort_order: 21 }
  ]);
};
