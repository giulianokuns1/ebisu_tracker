const express = require('express');
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");

const userController = require('../controllers/user');
const categoryController = require('../controllers/category');
const expenseController = require('../controllers/expense');
const billController = require('../controllers/bill');
const budgetController = require('../controllers/budget');
const paymentController = require('../controllers/payment');
const savingController = require('../controllers/saving');
const accountController = require('../controllers/account');
const dashboadController = require('../controllers/dashboard');
const paymentMethodController = require('../controllers/paymentMethod');
const wizardController = require('../controllers/wizard');
const currencyController = require('../controllers/currency');
const reportController = require('../controllers/report');
const annualPlanController = require('../controllers/annualPlan');

router.get('/testing', userController.testing);
router.get('/getUser', authenticateToken, userController.getUser);
router.get('/getSettingsData', authenticateToken, userController.getSettingsData);
router.post('/updateUserData', authenticateToken, userController.updateUser);

router.get('/getExpenses', authenticateToken, expenseController.getExpenses);
router.get('/getPendingExpenses', authenticateToken, expenseController.getPendingExpenses);
router.get('/getExpense', authenticateToken, expenseController.getExpense);
router.get('/newExpenseData', authenticateToken, expenseController.newExpenseData);
router.post('/createExpense', authenticateToken, expenseController.createUpdateExpense);
router.post('/deleteExpense', authenticateToken, expenseController.deleteExpense);
router.post('/deleteExpenseAmount', authenticateToken, expenseController.deleteExpenseAmount);
router.post('/updateExpenseMonthAmounts', authenticateToken, expenseController.updateMonthAmounts);

router.get('/getCategories', authenticateToken, categoryController.getCategories);
router.get('/getCategory', authenticateToken, categoryController.getCategory);
router.post('/newCategory', authenticateToken, categoryController.newCategory);
router.post('/deleteCategory', authenticateToken, categoryController.deleteCategory);
router.post('/updateCategoryOrder', authenticateToken, categoryController.updateOrder);

router.get('/getBills', authenticateToken, billController.getBills);

router.get('/getBudgets', authenticateToken, budgetController.getBudgets);
router.get('/getBudget', authenticateToken, budgetController.getBudget);
router.get('/newBudgetData', authenticateToken, budgetController.newBudgetData);
router.post('/newBudget', authenticateToken, budgetController.newBudget);
router.post('/deleteBudget', authenticateToken, budgetController.deleteBudget);

router.get('/getPayment', authenticateToken, paymentController.getPayment);
router.get('/getPayments', authenticateToken, paymentController.getPayments);
router.post('/createExpensePayment', authenticateToken, paymentController.createExpensePayment);
router.get('/newPaymentData', authenticateToken, paymentController.newPaymentData);
router.post('/newPayment', authenticateToken, paymentController.newPayment);
router.post('/deletePayment', authenticateToken, paymentController.deletePayment);

router.get('/getSavings', authenticateToken, savingController.getSavings);
router.get('/getSaving', authenticateToken, savingController.getSaving);
router.get('/newSavingData', authenticateToken, savingController.newSavingData);
router.post('/newSaving', authenticateToken, savingController.newSaving);
router.post('/newSavingTransaction', authenticateToken, savingController.newTransaction);
router.post('/updateSavingTransaction', authenticateToken, savingController.updateTransaction);
router.post('/deleteSavingTransaction', authenticateToken, savingController.deleteTransaction);
router.post('/deleteSaving', authenticateToken, savingController.deleteSaving);

router.get('/getAccounts', authenticateToken, accountController.getAccounts);
router.get('/getAccount', authenticateToken, accountController.getAccount);
router.post('/newAccount', authenticateToken, accountController.newAccount);
router.post('/deleteAccount', authenticateToken, accountController.deleteAccount);

router.get('/dashboard/get', authenticateToken, dashboadController.get);
router.get('/dashboard/navigation-summary', authenticateToken, dashboadController.getNavigationSummary);
router.get('/reports', authenticateToken, reportController.get);
router.get('/annual-plan', authenticateToken, annualPlanController.get);

router.get('/getPaymentMethods', authenticateToken, paymentMethodController.getPaymentMethods);
router.get('/getPaymentMethod', authenticateToken, paymentMethodController.getPaymentMethod);
router.get('/getPaymentMethodFormData', authenticateToken, paymentMethodController.getPaymentMethodFormData);
router.post('/newPaymentMethod', authenticateToken, paymentMethodController.newPaymentMethod);
router.post('/deletePaymentMethod', authenticateToken, paymentMethodController.deletePaymentMethod);

router.get('/getUserCurrencies', authenticateToken, currencyController.getUserCurrencies);
router.get('/getUserCurrency', authenticateToken, currencyController.getUserCurrency);
router.post('/saveUserCurrency', authenticateToken, currencyController.saveUserCurrency);
router.post('/deleteUserCurrency', authenticateToken, currencyController.deleteUserCurrency);

router.get('/wizard/config', authenticateToken, wizardController.getConfig);
router.post('/wizard/complete', authenticateToken, wizardController.complete);

module.exports = router;
