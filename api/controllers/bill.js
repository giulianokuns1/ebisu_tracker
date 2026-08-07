const Bill = require('../models/bill');

exports.getBills = async (req, res, next) => {
    try {
        var bills;
        const user_id = req.user && req.user.id;
        if (user_id) {
            bills = await Bill.getBills(user_id);
        }
        res.json({ bills });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching bills.' });
    }
};
