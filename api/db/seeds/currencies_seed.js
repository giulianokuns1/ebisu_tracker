/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('currencies').del();
  await knex('currencies').insert([
    { name: 'Dolar', symbol: '$' },
    { name: 'Euro', symbol: 'EUR' },
    { name: 'Peso Uruguayo', symbol: 'UYU' },
    { name: 'Japanese Yen', symbol: 'JPY' },
    { name: 'Pound Sterling', symbol: 'GBP' },
    { name: 'Chinese Yuan', symbol: 'CNY' },
    { name: 'Swiss Franc', symbol: 'CHF' },
    { name: 'Canadian Dollar', symbol: 'CAD' },
    { name: 'Mexican Peso', symbol: 'MXN' },
    { name: 'New Zealand Dollar', symbol: 'NZD' },
    { name: 'Brazilian Real', symbol: 'BRL' },
    { name: 'Peruvian Sol', symbol: 'PEN' },
    { name: 'Argentine Peso', symbol: 'ARS' },
    { name: 'Chilean Peso', symbol: 'CLP' },
    { name: 'Ecuadorian Dollar', symbol: 'USD' }
  ]);
};
