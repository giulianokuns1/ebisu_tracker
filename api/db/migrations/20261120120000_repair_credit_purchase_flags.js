exports.up = async function (knex) {
    // Repair only purchases linked to a credit method; never reclassify a
    // card's own statement or change payments and allocation history.
    await knex('expenses')
        .where('is_credit_card_purchase', false)
        .whereExists(function () {
            this.select(knex.raw('1'))
                .from('payment_methods as credit_method')
                .whereRaw('credit_method.id = expenses.payment_method_id')
                .whereRaw('credit_method.user_id = expenses.user_id')
                .where('credit_method.is_credit', true);
        })
        .whereNotExists(function () {
            this.select(knex.raw('1'))
                .from('payment_methods as statement_method')
                .whereRaw('statement_method.expense_id = expenses.id')
                .whereRaw('statement_method.user_id = expenses.user_id')
                .where('statement_method.is_credit', true);
        })
        .update({ is_credit_card_purchase: true });
};

// The prior false values cannot be distinguished from intentional values.
exports.down = async function () {};
