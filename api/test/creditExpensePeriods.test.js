const test = require('node:test');
const assert = require('node:assert/strict');
const Expense = require('../models/expense');
const ExpenseAmountSchedule = require('../models/expenseAmountSchedule');
const PaymentMethod = require('../models/paymentMethod');
const CreditPaymentAllocation = require('../models/creditPaymentAllocation');
const ExpenseLibrary = require('../libraries/expense');

test('credit purchases use only allocations for the requested period and never replace the card statement', async (t) => {
    const replace = (object, key, value) => {
        const original = object[key];
        object[key] = value;
        t.after(() => { object[key] = original; });
    };
    const rows = [
        { id: 3, name: 'Santander', payment_method_id: 8, is_credit_card_purchase: 0, expense_amount_id: 5, amount: 27845, currency_id: 3 },
        { id: 21, name: 'Seguro Auto', payment_method_id: 8, is_credit_card_purchase: 0, expense_amount_id: 24, amount: 10500, currency_id: 3 },
    ];
    replace(Expense, 'getExpensesByAmount', async () => rows.map((row) => ({ ...row })));
    replace(ExpenseAmountSchedule, 'getByUserId', async () => []);
    replace(PaymentMethod, 'getCreditPaymentMethods', async () => [{ id: 8, expense_id: 3 }]);
    replace(PaymentMethod, 'getCreditStatementPayments', async () => [{ payment_method_id: 8, currency_id: 3, statement_name: 'Santander', amount: 27845, payment_amount: 27845 }]);
    replace(CreditPaymentAllocation, 'getPurchaseAllocations', async (_user, ids, month, year) => {
        assert.deepEqual(ids, [24]);
        assert.equal(year, 2026);
        return month === 11 ? [{ expense_amount_id: 24, amount: 10500 }] : [];
    });
    const november = await ExpenseLibrary.getExpensesExtended(1, 11, [], [], 2026);
    assert.equal(november.expenses[0].is_credit_card_purchase, false);
    assert.equal(november.expenses[0].amount, 27845);
    assert.equal(november.expenses[1].is_credit_card_purchase, true);
    assert.equal(november.expenses[1].paymentTotal, 10500);
    assert.equal(november.expenses[1].isFullPaid, true);
    const december = await ExpenseLibrary.getExpensesExtended(1, 12, [], [], 2026);
    assert.equal(december.expenses[1].paymentTotal, 0);
    assert.equal(december.expenses[1].isFullPaid, false);
});
