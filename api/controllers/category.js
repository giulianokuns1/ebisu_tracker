const Category = require('../models/category');
const CategoryLibrary = require('../libraries/category');
const User = require("../models/user");

exports.getCategories = async (req, res, next) => {
    try {
        var categories;
        const user_id = req.user && req.user.id;
        if (user_id) {
            categories = await Category.getCategories(user_id);
        }
        res.json({ categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching categories.' });
    }
};
exports.newCategory = async (req, res, next) => {
    try {
        var category;
        var categoryId;
        const { id, name, icon, color } = req.body;
        const categoryColor = /^#[0-9a-fA-F]{6}$/.test(color || '') ? color : '#4FD6BE';
        const user_id = req.user && req.user.id;
        if (user_id) {
            if (id) {
                category = await Category.updateCategory(id, user_id, name, icon, categoryColor);
            } else {
                category = await Category.newCategory(user_id, name, icon, categoryColor);
            }
            categoryId = category && category.length && category[0];
            if (categoryId) {
                category = await Category.getCategory(categoryId);
                category = category && category.length && category[0];
            }
        }
        res.json({ category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching categories.' });
    }
};
exports.getCategory = async (req, res, next) => {
    try {
        var category;
        const userId = req.user && req.user.id;
        const categoryId = req.query && req.query.categoryId;
        if (userId && categoryId) {
            category = await Category.getCategory(categoryId);
            category = category && category[0];
        }
        res.json({ category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the category.' });
    }
};
exports.deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.body;
        const userId = req.user && req.user.id;
        if (userId && id) {
            await CategoryLibrary.deleteCategory(userId, id);
        }
        res.status(200).json({ message: 'Delete successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error creating the category.' });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const categoryIds = req.body && req.body.categoryIds;
        if (!userId || !Array.isArray(categoryIds) || categoryIds.some((id) => !Number(id))) {
            return res.status(400).json({ error: 'Invalid category order.' });
        }
        const categories = await Category.getCategories(userId);
        if (categories.length !== categoryIds.length || new Set(categoryIds.map(Number)).size !== categories.length || categories.some((category) => !categoryIds.map(Number).includes(category.id))) {
            return res.status(400).json({ error: 'Invalid category order.' });
        }
        await Category.updateOrder(userId, categoryIds.map(Number));
        return res.status(200).json({ categories: await Category.getCategories(userId) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while updating category order.' });
    }
};
