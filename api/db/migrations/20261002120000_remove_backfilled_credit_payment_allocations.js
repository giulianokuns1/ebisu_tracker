exports.up = async function(knex) {
    // The initial allocation migration inferred links from unrelated historical
    // statement payments. Remove those generated rows so only explicit allocations remain.
    await knex('credit_payment_allocations').del();
};

exports.down = async function() {
    // Removed inferred allocations cannot be reconstructed safely.
};
