const User = require('../models/user');
const Expense = require("../models/expense");
const e = require("express");
const Currency = require("../models/currency");

exports.testing = async (req, res, next) => {
    res.json({ 'Status': 'OK' });
}
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.fetchAll();
        res.json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
};
exports.getUser = async (req, res, next) => {
    try {
        let user;
        const userId = req.user && req.user.id;
        if (userId) {
            user = await User.getById(userId);
        }
        res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
};
exports.getSettingsData = async (req, res, next) => {
    try {
        let user;
        let currencies;
        const userId = req.user && req.user.id;
        if (userId) {
            user = await User.getById(userId);
            currencies = await Currency.getCurrencies(userId);
        }
        res.json({
            user,
            currencies
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching settings data.' });
    }
};
exports.updateUser = async (req, res, next) => {
    var user;
    var emailUsed;
    try {
        const { firstname, lastname, email, defaultCurrencyId, dashboardShowNextMonth, timezone } = req.body;
        const userId = req.user && req.user.id;
        if (userId) {
            user = await User.getById(userId);
            if (email && email !== user.email) {
                emailUsed = await isEmailUsed(email);
                if (emailUsed) {
                    return res.json({ error: 'The email is already used.' });
                }
            }
            if (firstname !== undefined && lastname !== undefined && email !== undefined) {
                await User.updateUser(userId, firstname, lastname, email, defaultCurrencyId || null);
            } else if (defaultCurrencyId !== undefined) {
                await User.updateDefaultCurrency(userId, defaultCurrencyId || null);
            }
            if (dashboardShowNextMonth !== undefined) {
                await User.updateDashboardPreferences(userId, Boolean(dashboardShowNextMonth));
            }
            if (typeof timezone === 'string' && timezone.length <= 64) {
                try {
                    Intl.DateTimeFormat(undefined, { timeZone: timezone });
                    await User.updateTimezone(userId, timezone);
                } catch {
                    return res.status(400).json({ error: 'Invalid timezone.' });
                }
            }
            user = await User.getById(userId);
        }
        return res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error updating the user.' });
    }
};

const isEmailUsed = async (email) => {
    var userByEmail = await User.getByEmail(email);
    return !!userByEmail;
};
