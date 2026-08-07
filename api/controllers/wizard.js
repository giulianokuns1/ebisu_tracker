const knex = require('knex')(require('../knexfile'));
const ExpenseType = require('../models/expenseType');
const moment = require('moment');

exports.getConfig = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const [user, currencies, wizardCategories, wizardExpenses, wizardPaymentMethods, expenseTypes] = await Promise.all([
            knex('users').select('id', 'wizard_completed', 'default_currency_id').where({ id: userId }).first(),
            knex('currencies').select('*').orderBy('name', 'asc'),
            knex('wizard_categories').select('*').where({ active: 1 }).orderBy('sort_order', 'asc'),
            knex('wizard_expenses').select('*').where({ active: 1 }).orderBy('sort_order', 'asc'),
            knex('wizard_payment_methods').select('*').where({ active: 1 }).orderBy('sort_order', 'asc'),
            knex('expenses_type').select('*').orderBy('order', 'asc')
        ]);

        res.json({ user, currencies, wizardCategories, wizardExpenses, wizardPaymentMethods, expenseTypes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching wizard config.' });
    }
};

exports.complete = async (req, res) => {
    const userId = req.user && req.user.id;
    const {
        selectedCurrencyIds,
        defaultCurrencyId,
        selectedCategories,
        selectedExpenses,
        selectedPaymentMethods,
        defaultPaymentMethodName
    } = req.body;

    try {
        await knex.transaction(async (trx) => {
            if (selectedCurrencyIds && selectedCurrencyIds.length) {
                for (const currencyId of selectedCurrencyIds) {
                    const existingUserCurrency = await trx('user_currencies')
                        .where({ user_id: userId, currency_id: currencyId })
                        .first();
                    if (!existingUserCurrency) {
                        await trx('user_currencies').insert({
                            user_id: userId,
                            currency_id: currencyId,
                            created_from_wizard: true
                        });
                    }
                }
            }

            await trx('users').where({ id: userId }).update({
                default_currency_id: defaultCurrencyId || null,
                wizard_completed: true
            });

            const createdCategoriesByName = {};
            if (selectedCategories && selectedCategories.length) {
                for (const wizardCategory of selectedCategories) {
                    const finalName = wizardCategory.customName || wizardCategory.name;
                    let existingCategory = await trx('categories').where({ user_id: userId, name: finalName }).first();
                    if (!existingCategory) {
                        const inserted = await trx('categories').insert({
                            user_id: userId,
                            name: finalName,
                            icon: wizardCategory.icon || 'bi-tag',
                            created_from_wizard: true
                        });
                        existingCategory = { id: inserted[0], name: finalName };
                    }
                    createdCategoriesByName[wizardCategory.name] = existingCategory;
                    createdCategoriesByName[finalName] = existingCategory;
                }
            }

            if (selectedPaymentMethods && selectedPaymentMethods.length) {
                for (const wizardPaymentMethod of selectedPaymentMethods) {
                    const finalName = wizardPaymentMethod.customName || wizardPaymentMethod.name;
                    let existingPaymentMethod = await trx('payment_methods').where({ user_id: userId, name: finalName }).first();

                    if (!existingPaymentMethod) {
                        const isCredit = !!wizardPaymentMethod.is_credit;
                        const paymentType = await trx('payments_type').select('id').whereRaw('LOWER(name) = ?', [String(wizardPaymentMethod.name || '').toLowerCase().includes('card') ? (isCredit ? 'credit' : 'debit') : String(wizardPaymentMethod.name || '').toLowerCase()]).first();
                        let expenseId = null;
                        if (isCredit) {
                            const categoryInsert = await trx('categories').insert({
                                user_id: userId,
                                name: finalName,
                                icon: 'bi-credit-card',
                                created_from_wizard: true
                            });
                            const categoryId = categoryInsert && categoryInsert[0];

                            const dueDate = moment().format('YYYY-MM-DD');
                            const expenseInsert = await trx('expenses').insert({
                                user_id: userId,
                                name: finalName,
                                category_id: categoryId,
                                type_id: ExpenseType.MONTHLY_ID,
                                due_date: dueDate,
                                due_date_day: 10,
                                inactive: 0,
                                created_from_wizard: true
                            });
                            expenseId = expenseInsert && expenseInsert[0];

                            if (expenseId) {
                                for (const currencyId of (selectedCurrencyIds || [])) {
                                    await trx('expense_amounts').insert({
                                        expense_id: expenseId,
                                        currency_id: currencyId,
                                        amount: 0
                                    });
                                }
                            }
                        }

                        const inserted = await trx('payment_methods').insert({
                            user_id: userId,
                            name: finalName,
                            is_credit: isCredit,
                            payment_type_id: paymentType ? paymentType.id : null,
                            due_date_day: isCredit ? 10 : null,
                            statement_date_day: isCredit ? 10 : null,
                            expense_id: expenseId,
                            is_default: defaultPaymentMethodName === finalName,
                            created_from_wizard: true
                        });

                        if (isCredit && expenseId) {
                            await trx('expenses').where({ id: expenseId, user_id: userId }).update({ payment_method_id: inserted[0] });
                        }
                    }
                }
            }

            if (defaultPaymentMethodName) {
                await trx('payment_methods')
                    .where({ user_id: userId })
                    .update({ is_default: 0 });
                await trx('payment_methods')
                    .where({ user_id: userId, name: defaultPaymentMethodName })
                    .update({ is_default: 1 });
            }

            if (selectedExpenses && selectedExpenses.length) {
                for (const wizardExpense of selectedExpenses) {
                    const finalExpenseName = wizardExpense.customName || wizardExpense.name;
                    const existingExpense = await trx('expenses').where({ user_id: userId, name: finalExpenseName, inactive: 0 }).first();
                    if (existingExpense) {
                        continue;
                    }

                    const categoryRef = createdCategoriesByName[wizardExpense.selectedCategoryName] || createdCategoriesByName[wizardExpense.default_category_name];
                    if (!categoryRef) {
                        continue;
                    }

                    const expenseTypeId = parseInt(wizardExpense.expenseTypeId || ExpenseType.ONCE_ID, 10);
                    const expenseDueDay = wizardExpense.expenseDueDay || null;
                    const expenseDueDate = wizardExpense.expenseDueDate
                        ? moment(wizardExpense.expenseDueDate).format('YYYY-MM-DD')
                        : moment().format('YYYY-MM-DD');

                    const expenseInsert = await trx('expenses').insert({
                        user_id: userId,
                        name: finalExpenseName,
                        category_id: categoryRef.id,
                        type_id: expenseTypeId,
                        due_date: expenseTypeId === ExpenseType.MONTHLY_ID ? expenseDueDate : expenseDueDate,
                        due_date_day: expenseTypeId === ExpenseType.MONTHLY_ID ? expenseDueDay : null,
                        inactive: 0,
                        created_from_wizard: 1
                    });

                    const createdExpenseId = expenseInsert && expenseInsert[0];
                    if (createdExpenseId) {
                        for (const expenseAmount of (wizardExpense.expenseAmounts || [])) {
                            const currencyId = parseInt(expenseAmount.currency_id, 10);
                            const amountValue = parseFloat(expenseAmount.amount || 0);
                            const isDefaultCurrency = parseInt(defaultCurrencyId, 10) === currencyId;
                            const shouldInsert = isDefaultCurrency || amountValue !== 0;

                            if (!shouldInsert || Number.isNaN(currencyId)) {
                                continue;
                            }

                            await trx('expense_amounts').insert({
                                expense_id: createdExpenseId,
                                currency_id: currencyId,
                                amount: Number.isNaN(amountValue) ? 0 : amountValue
                            });
                        }
                    }
                }
            }
        });

        res.json({ success: true, message: 'Starting setup completed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error completing wizard setup.' });
    }
};
