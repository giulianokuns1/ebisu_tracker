const Currency = require('../models/currency');
const UserCurrency = require('../models/userCurrency');

exports.getUserCurrencies = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const [userCurrencies, currencies] = await Promise.all([
            UserCurrency.getUserCurrencies(userId),
            Currency.getCurrencies()
        ]);
        res.json({ userCurrencies, currencies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching currencies.' });
    }
};

exports.getUserCurrency = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const currencyId = req.query && req.query.currencyId;
        const [userCurrency, currencies] = await Promise.all([
            UserCurrency.getUserCurrency(userId, currencyId),
            Currency.getCurrencies()
        ]);
        res.json({ userCurrency, currencies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching currency.' });
    }
};

exports.saveUserCurrency = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const { id, currencyId, customName, customSymbol } = req.body;
        const payload = {
            user_id: userId,
            currency_id: currencyId || null,
            custom_name: customName || null,
            custom_symbol: customSymbol || null,
            created_from_wizard: false
        };
        if (id) {
            await UserCurrency.update(userId, id, payload);
        } else {
            await UserCurrency.create(payload);
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error saving currency.' });
    }
};

exports.deleteUserCurrency = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const { id } = req.body;
        await UserCurrency.remove(userId, id);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting currency.' });
    }
};
