exports.up = async function(knex) {
    const cards = await knex('payment_methods').where({ is_credit: 1 }).whereNotNull('expense_id');

    for (const card of cards) {
        const expenses = await knex('expenses').where({ user_id: card.user_id, payment_method_id: card.id, inactive: 0 }).orderBy('id');
        if (expenses.length <= 1) continue;

        const retained = expenses[0];
        const retainedAmounts = await knex('expense_amounts').where({ expense_id: retained.id });
        const retainedByCurrency = new Map(retainedAmounts.map((amount) => [Number(amount.currency_id), amount]));

        for (const duplicate of expenses.slice(1)) {
            const duplicateAmounts = await knex('expense_amounts').where({ expense_id: duplicate.id });
            for (const duplicateAmount of duplicateAmounts) {
                if (!retainedByCurrency.has(Number(duplicateAmount.currency_id))) {
                    const [newAmountId] = await knex('expense_amounts').insert({
                        expense_id: retained.id,
                        currency_id: duplicateAmount.currency_id,
                        amount: duplicateAmount.amount,
                    });
                    retainedByCurrency.set(Number(duplicateAmount.currency_id), { ...duplicateAmount, id: newAmountId });
                }
            }
            await knex('expenses').where({ id: duplicate.id, user_id: card.user_id }).update({ inactive: 1 });
        }

        await knex('payment_methods').where({ id: card.id, user_id: card.user_id }).update({ expense_id: retained.id });
    }
};

exports.down = async function() {
    // Consolidation intentionally preserves data and cannot be safely reversed.
};
