const knex = require('knex')(require('../knexfile'));

exports.get = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const currencyId = req.query.currencyId;
        const year = Number(req.query.year) || new Date().getFullYear();
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const paymentQuery = knex('payments')
            .select('payments.amount', 'payments.created_at', 'categories.name as category_name', 'currencies.symbol as currency_symbol', 'currencies.id as currency_id')
            .where('payments.user_id', userId)
            .whereRaw('YEAR(payments.created_at) = ?', [year])
            .leftJoin('expense_amounts', 'payments.expense_amount_id', 'expense_amounts.id')
            .leftJoin('expenses', 'expense_amounts.expense_id', 'expenses.id')
            .leftJoin('categories', 'expenses.category_id', 'categories.id')
            .leftJoin('currencies', 'expense_amounts.currency_id', 'currencies.id');
        const incomeQuery = knex('income_transactions')
            .select('amount', 'received_at', 'currencies.symbol as currency_symbol', 'currencies.id as currency_id')
            .where('income_transactions.user_id', userId)
            .whereRaw('YEAR(received_at) = ?', [year])
            .leftJoin('currencies', 'income_transactions.currency_id', 'currencies.id');
        if (currencyId) {
            paymentQuery.where('expense_amounts.currency_id', currencyId);
            incomeQuery.where('income_transactions.currency_id', currencyId);
        }
        const [payments, income] = await Promise.all([paymentQuery, incomeQuery]);
        const symbol = payments[0]?.currency_symbol || income[0]?.currency_symbol || '';
        const monthly = Array.from({ length: 12 }, (_, index) => ({ label: new Date(year, index, 1).toLocaleDateString('en', { month: 'short' }), expenses: 0, income: 0 }));
        const categories = {};
        payments.forEach((payment) => {
            const amount = Number(payment.amount) || 0;
            monthly[new Date(payment.created_at).getMonth()].expenses += amount;
            const name = payment.category_name || 'Other';
            categories[name] = (categories[name] || 0) + amount;
        });
        income.forEach((transaction) => { monthly[new Date(transaction.received_at).getMonth()].income += Number(transaction.amount) || 0; });
        const topExpenses = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, amount]) => ({ name, amount }));
        return res.json({ currencySymbol: symbol, monthly, categories: Object.entries(categories).map(([name, amount]) => ({ name, amount })), topExpenses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while generating reports.' });
    }
};
