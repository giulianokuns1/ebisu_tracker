const PaymentMethod = require("../models/paymentMethod");
const {CASH_PAYMENT_ID} = require("../models/paymentsType");
const Category = require("../models/category");
const Expense = require("../models/expense");
const {ONCE_ID} = require("../models/expenseType");
const User = require("../models/user");

/**
 * Setups the customer on the register.
 * Creates the cash payment method, the first category and the first expense.
 * @param userId
 * @return {Promise<*|null>}
 */
exports.setupCustomer = async (userId) => {
    await PaymentMethod.newPaymentMethod(
        userId,
        {
            payment_type_id: CASH_PAYMENT_ID,
            is_credit: false,
            name: 'Cash',
            is_default: true
        }
    );
    await User.updateDefaultCurrency(userId, 1);
    let category = await Category.newCategory(userId, 'My first category', 'bi-bag-fill');
    let expense = await Expense.create(
        userId,
        {
            name: 'My first expense',
            category_id: category && category[0],
            due_date: new Date(),
            type_id: ONCE_ID
        }
    );
    return await Expense.newExpenseAmount({
        expense_id: expense && expense[0],
        amount: 1,
        currency_id: 1
    });
};
