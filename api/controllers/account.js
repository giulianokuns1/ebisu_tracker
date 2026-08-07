const Account = require('../models/accounts');

exports.getAccounts = async (req, res, next) => {
    try {
        var accounts;
        const user_id = req.user && req.user.id;
        if (user_id) {
            accounts = await Account.getAccounts(user_id);
        }
        res.json({ accounts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching accounts.' });
    }
};
exports.getAccount = async (req, res, next) => {
    try {
        var account;
        const userId = req.user && req.user.id;
        const accountId = req.query && req.query.accountId;
        if (userId && accountId) {
            account = await Account.getAccount(userId, accountId);
            account = account && account[0];
        }
        res.json({ account });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching accounts.' });
    }
};
exports.newAccount = async (req, res, next) => {
    try {
        const { id, name, accountNumber } = req.body;
        const userId = req.user && req.user.id;
        if (userId) {
            if (id) {
                account = await Account.updateAccount(id, userId, name, accountNumber);
            } else {
                account = await Account.newAccount(userId, name, accountNumber);
            }
            accountId = account && account.length && account[0];
        }
        res.json({ accountId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error creating the account.' });
    }
};
exports.deleteAccount = async (req, res, next) => {
    try {
        const { id } = req.body;
        const userId = req.user && req.user.id;
        if (userId && id) {
            await Account.deleteAccount(id, userId);
        }
        res.status(200).json({ message: 'Delete successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error creating the account.' });
    }
};
