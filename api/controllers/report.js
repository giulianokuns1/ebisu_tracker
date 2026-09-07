const knex = require('knex')(require('../knexfile'));
const Currency = require('../models/currency');
const User = require('../models/user');
const UserTime = require('../utils/userTime');

const buildReport = (payments, currency, year, timezone) => {
    const monthly = Array.from({ length: 12 }, (_, index) => ({
        label: new Date(year, index, 1).toLocaleDateString('en', { month: 'short' }),
        amount: 0,
    }));
    const categories = {};
    const largestPayments = payments.map((payment) => ({
        id: payment.id,
        name: payment.expense_name || 'Other',
        category: payment.category_name || 'Other',
        amount: Number(payment.amount) || 0,
        date: payment.created_at,
    }));

    payments.forEach((payment) => {
        const amount = Number(payment.amount) || 0;
        const monthIndex = UserTime.getMonthFromDate(payment.created_at, timezone) - 1;
        monthly[monthIndex].amount += amount;
        const categoryName = payment.category_name || 'Other';
        if (!categories[categoryName]) categories[categoryName] = { name: categoryName, amount: 0, color: payment.category_color || '#809297', monthly: Array(12).fill(0) };
        categories[categoryName].amount += amount;
        categories[categoryName].monthly[monthIndex] += amount;
    });

    const categoryList = Object.values(categories).sort((a, b) => b.amount - a.amount);
    const total = monthly.reduce((sum, item) => sum + item.amount, 0);
    const activeMonths = monthly.filter((item) => item.amount > 0);
    const highestMonth = monthly.reduce((highest, item) => item.amount > highest.amount ? item : highest, monthly[0]);
    const categoryBreakdown = categoryList.slice(0, 5);
    const otherCategories = categoryList.slice(5);
    if (otherCategories.length) {
        categoryBreakdown.push({
            name: 'Other',
            amount: otherCategories.reduce((sum, item) => sum + item.amount, 0),
            color: '#809297',
            monthly: monthly.map((_, index) => otherCategories.reduce((sum, item) => sum + item.monthly[index], 0)),
        });
    }

    return {
        currency,
        monthly,
        categories: categoryList.map((category) => ({ ...category, percentage: total ? (category.amount / total) * 100 : 0 })),
        categoryBreakdown,
        largestPayments: largestPayments.sort((a, b) => b.amount - a.amount).slice(0, 5),
        summary: {
            total,
            average: activeMonths.length ? total / activeMonths.length : 0,
            highestMonth,
            paymentCount: payments.length,
        },
    };
};

exports.get = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await User.getById(userId);
        const timezone = user.timezone || 'UTC';
        const year = Number(req.query.year) || UserTime.getCurrentPeriod(timezone).year;
        const currencies = await Currency.getCurrencies(userId);
        const payments = await knex('payments')
            .select(
                'payments.id',
                'payments.amount',
                'payments.created_at',
                'expenses.name as expense_name',
                'categories.name as category_name',
                'categories.color as category_color',
                'expense_amounts.currency_id'
            )
            .where('payments.user_id', userId)
            .whereRaw('YEAR(payments.created_at) = ?', [year])
            .leftJoin('expense_amounts', 'payments.expense_amount_id', 'expense_amounts.id')
            .leftJoin('expenses', 'expense_amounts.expense_id', 'expenses.id')
            .leftJoin('categories', 'expenses.category_id', 'categories.id')
            .orderBy('payments.created_at', 'desc');
        const paymentsByCurrency = payments.reduce((grouped, payment) => {
            const key = String(payment.currency_id);
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(payment);
            return grouped;
        }, {});
        const reportsByCurrency = Object.fromEntries(currencies.map((currency) => [currency.id, buildReport(paymentsByCurrency[String(currency.id)] || [], currency, year, timezone)]));

        return res.json({ year, currencies, reportsByCurrency });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while generating reports.' });
    }
};
