const Budget = require('../models/budget');
const Category = require("../models/category");
const BudgetType = require("../models/budgetType");
const Currency = require("../models/currency");

exports.getBudgets = async (req, res, next) => {
    try {
        var budgets;
        const user_id = req.user && req.user.id;
        if (user_id) {
            budgets = await Budget.getBudgets(user_id);
        }
        res.json({ budgets });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching budgets.' });
    }
};
exports.getBudget = async (req, res, next) => {
    try {
        var budget;
        const userId = req.user && req.user.id;
        const budgetId = req.query && req.query.budgetId;
        if (userId && budgetId) {
            budget = await Budget.getBudget(userId, budgetId);
            budget = budget && budget[0];
        }
        res.json({ budget });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching budgets.' });
    }
};
exports.newBudgetData = async (req, res, next) => {
    try {
        var categories;
        var budgetsTypes;
        const userId = req.user && req.user.id;
        if (userId) {
            categories = await Category.getCategories(userId);
            budgetsTypes = await BudgetType.getBudgetsType();
            currencies = await Currency.getCurrencies(userId);
        }
        res.json({
            categories,
            budgetsTypes,
            currencies
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching budgets.' });
    }
};
exports.newBudget = async (req, res, next) => {
    try {
        const { id, name, amount, currency, category, budgetType } = req.body;
        const userId = req.user && req.user.id;
        if (userId) {
            if (id) {
                budget = await Budget.updateBudget(id, userId, name, amount, currency, category, budgetType);
            } else {
                budget = await Budget.newBudget(userId, name, amount, currency, category, budgetType);
            }
            budgetId = budget && budget.length && budget[0];
        }
        res.json({ budgetId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error creating the budget.' });
    }
};
exports.deleteBudget = async (req, res, next) => {
    try {
        const { id } = req.body;
        const userId = req.user && req.user.id;
        if (userId && id) {
            await Budget.deleteBudget(id, userId);
        }
        res.status(200).json({ message: 'Delete successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error creating the budget.' });
    }
};
