exports.up = async function(knex) {
    await knex.schema.createTable('credit_payment_allocations', function(table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.integer('payment_id').unsigned().notNullable();
        table.integer('expense_amount_id').unsigned().notNullable();
        table.decimal('amount', 14, 2).notNullable();
        table.timestamps(true, true);
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.foreign('payment_id').references('payments.id').onDelete('CASCADE');
        table.foreign('expense_amount_id').references('expense_amounts.id').onDelete('CASCADE');
        table.unique(['payment_id', 'expense_amount_id']);
    });

    const cardPayments = await knex('payments as payments')
        .select('payments.id', 'payments.user_id', 'payments.expense_amount_id', 'payments.amount', 'payments.created_at', 'expense_amounts.currency_id', 'payment_methods.id as card_id')
        .leftJoin('expense_amounts', 'expense_amounts.id', 'payments.expense_amount_id')
        .leftJoin('expenses', 'expenses.id', 'expense_amounts.expense_id')
        .leftJoin('payment_methods', function() {
            this.on('payment_methods.expense_id', '=', 'expenses.id').andOn('payment_methods.is_credit', '=', knex.raw('?', [1]));
        })
        .whereNotNull('payment_methods.id')
        .orderBy('payments.created_at')
        .orderBy('payments.id');

    for (const payment of cardPayments) {
        let available = Number(payment.amount || 0);
        if (!available) continue;
        const purchases = await knex('expenses as expenses')
            .select('expense_amounts.id as expense_amount_id', 'expense_amounts.amount')
            .leftJoin('expense_amounts', 'expense_amounts.expense_id', 'expenses.id')
            .where({ 'expenses.user_id': payment.user_id, 'expenses.payment_method_id': payment.card_id, 'expenses.is_credit_card_purchase': 1, 'expenses.inactive': 0, 'expense_amounts.currency_id': payment.currency_id })
            .orderBy('expenses.due_date')
            .orderBy('expenses.id');
        for (const purchase of purchases) {
            if (!available) break;
            const allocated = await knex('credit_payment_allocations').where({ user_id: payment.user_id, expense_amount_id: purchase.expense_amount_id }).sum({ amount: 'amount' }).first();
            const remaining = Math.max(0, Number(purchase.amount) - Number(allocated.amount || 0));
            const amount = Math.min(available, remaining);
            if (!amount) continue;
            await knex('credit_payment_allocations').insert({ user_id: payment.user_id, payment_id: payment.id, expense_amount_id: purchase.expense_amount_id, amount });
            available -= amount;
        }
    }
};

exports.down = function(knex) {
    return knex.schema.dropTable('credit_payment_allocations');
};
