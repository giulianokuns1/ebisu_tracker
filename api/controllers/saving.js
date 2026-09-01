const Saving = require('../models/saving');
const Currency = require('../models/currency');
const User = require('../models/user');
const UserTime = require('../utils/userTime');
const dateKey = (date) => date instanceof Date ? date.toISOString().slice(0, 10) : String(date).slice(0, 10);

const summarize = (goals, transactions, rangeTransactions) => {
    const totals = {};
    const goalBalances = goals.map((goal) => {
        const balance = transactions.filter((transaction) => transaction.saving_id === goal.id).reduce((sum, transaction) => sum + Number(transaction.amount), 0);
        const key = goal.currency_id || 'none';
        if (!totals[key]) totals[key] = { symbol: goal.currency_symbol || '', balance: 0, monthly: 0, goals: [] };
        totals[key].balance += balance;
        totals[key].monthly += rangeTransactions.filter((transaction) => transaction.saving_id === goal.id).reduce((sum, transaction) => sum + Number(transaction.amount), 0);
        totals[key].goals.push({ ...goal, balance, percentage: Number(goal.target_amount) ? Math.min(100, (balance / Number(goal.target_amount)) * 100) : 0 });
        return { ...goal, balance, percentage: Number(goal.target_amount) ? Math.min(100, (balance / Number(goal.target_amount)) * 100) : 0 };
    });
    const unassigned = transactions.filter((transaction) => !transaction.saving_id);
    unassigned.forEach((transaction) => {
        const key = transaction.currency_id || 'none';
        if (!totals[key]) totals[key] = { symbol: transaction.currency_symbol || '', balance: 0, monthly: 0, goals: [] };
        totals[key].balance += Number(transaction.amount);
        totals[key].monthly += rangeTransactions.filter((item) => item.id === transaction.id).reduce((sum, item) => sum + Number(item.amount), 0);
    });
    return { goals: goalBalances, totals, unassignedTotal: unassigned.reduce((sum, transaction) => sum + Number(transaction.amount), 0) };
};

exports.getSavings = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const { startDate, endDate } = req.query;
        const [goals, transactions, rangeTransactions, currencies, user] = await Promise.all([Saving.getGoals(userId), Saving.getTransactions(userId), Saving.getTransactions(userId, startDate, endDate), Currency.getCurrencies(userId), User.getById(userId)]);
        const today = UserTime.getCurrentDate(user.timezone);
        const currentTransactions = transactions.filter((transaction) => dateKey(transaction.transaction_date) <= today);
        const chartTransactions = transactions.filter((transaction) => !endDate || dateKey(transaction.transaction_date) <= endDate);
        const summary = summarize(goals, currentTransactions, rangeTransactions);
        res.json({ ...summary, transactions: rangeTransactions, chartTransactions, currencies });
    } catch (error) { console.error(error); res.status(500).json({ error: 'An error occurred while fetching savings.' }); }
};
exports.getSaving = async (req, res) => { try { res.json({ saving: await Saving.getGoal(req.user.id, req.query.savingId) }); } catch (error) { res.status(500).json({ error: 'An error occurred while fetching the saving.' }); } };
exports.newSavingData = async (req, res) => { try { res.json({ currencies: await Currency.getCurrencies(req.user.id) }); } catch (error) { res.status(500).json({ error: 'An error occurred while fetching saving data.' }); } };
exports.newSaving = async (req, res) => {
    try {
        const { id, name, targetAmount, currencyId, comment, startingAmount } = req.body;
        const values = { name, targetAmount: Number(targetAmount) || 0, currencyId, comment };
        const result = id ? await Saving.updateGoal(id, req.user.id, values) : await Saving.createGoal(req.user.id, values);
        const savingId = id || result[0];
        if (!id && Number(startingAmount)) await Saving.createTransaction(req.user.id, { savingId, currencyId, amount: Number(startingAmount), comment: 'Opening balance', transactionDate: new Date() });
        res.json({ savingId });
    } catch (error) { console.error(error); res.status(500).json({ error: 'An error occurred while saving the goal.' }); }
};
exports.newTransaction = async (req, res) => { try { const result = await Saving.createTransaction(req.user.id, req.body); res.json({ transactionId: result[0] }); } catch (error) { res.status(500).json({ error: 'An error occurred while saving the transaction.' }); } };
exports.updateTransaction = async (req, res) => { try { await Saving.updateTransaction(req.body.id, req.user.id, req.body); res.json({ success: true }); } catch (error) { res.status(500).json({ error: 'An error occurred while updating the transaction.' }); } };
exports.deleteTransaction = async (req, res) => { try { await Saving.deleteTransaction(req.body.id, req.user.id); res.json({ success: true }); } catch (error) { res.status(500).json({ error: 'An error occurred while deleting the transaction.' }); } };
exports.deleteSaving = async (req, res) => { try { await Saving.deleteSaving(req.body.id, req.user.id); res.json({ message: 'Delete successfully' }); } catch (error) { res.status(500).json({ error: 'An error occurred while deleting the saving.' }); } };
