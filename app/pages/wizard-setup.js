import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { API_BASE_URL, WEBSITE_NAME } from '@/constants';
import { withAuth } from '@/Hoc/withAuth';
import { useTranslation } from '@/Hooks/useTranslation';
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import styles from '@/Components/Wizard/WizardSetup.module.scss';
import Button from '@/Components/UI/Button';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/router';
import { Dialog } from 'primereact/dialog';
import DatePicker from 'react-datepicker';
import { ProgressSpinner } from 'primereact/progressspinner';
import Loading from '@/Components/UI/Loading';

const STEPS = ['Currencies', 'Categories', 'Expenses', 'Payment Methods'];

function WizardSetupPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const toastRef = useRef(null);
    const [step, setStep] = useState(0);
    const [currencies, setCurrencies] = useState([]);
    const [wizardCategories, setWizardCategories] = useState([]);
    const [wizardExpenses, setWizardExpenses] = useState([]);
    const [wizardPaymentMethods, setWizardPaymentMethods] = useState([]);
    const [expenseTypes, setExpenseTypes] = useState([]);

    const [selectedCurrencyIds, setSelectedCurrencyIds] = useState([]);
    const [defaultCurrencyId, setDefaultCurrencyId] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedExpenses, setSelectedExpenses] = useState([]);
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
    const [defaultPaymentMethodName, setDefaultPaymentMethodName] = useState('');
    const [customCurrencies, setCustomCurrencies] = useState([]);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [customCurrencyName, setCustomCurrencyName] = useState('');
    const [customCurrencySymbol, setCustomCurrencySymbol] = useState('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [customCategoryName, setCustomCategoryName] = useState('');
    const [customCategoryIcon, setCustomCategoryIcon] = useState('bi-tag');
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [customExpenseName, setCustomExpenseName] = useState('');
    const [customExpenseCategory, setCustomExpenseCategory] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [showExpenseEditModal, setShowExpenseEditModal] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState(null);
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
    const [customPaymentMethodName, setCustomPaymentMethodName] = useState('');
    const [customPaymentMethodIsCredit, setCustomPaymentMethodIsCredit] = useState(false);
    const [isSavingWizard, setIsSavingWizard] = useState(false);
    const [isLoadingWizard, setIsLoadingWizard] = useState(true);

    useEffect(() => {
        const load = async () => {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/wizard/config`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrencies(response.data.currencies || []);
            setWizardCategories(response.data.wizardCategories || []);
            setWizardExpenses(response.data.wizardExpenses || []);
            setWizardPaymentMethods(response.data.wizardPaymentMethods || []);
            setExpenseTypes(response.data.expenseTypes || []);
            setIsLoadingWizard(false);
        };
        load().catch((error) => {
            console.error(error);
            setIsLoadingWizard(false);
        });
        const storedCustomCurrencies = sessionStorage.getItem('wizard_custom_currencies');
        if (storedCustomCurrencies) {
            setCustomCurrencies(JSON.parse(storedCustomCurrencies));
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('wizard_custom_currencies', JSON.stringify(customCurrencies));
    }, [customCurrencies]);

    const orderedMainCurrencies = useMemo(() => {
        const usd = currencies.find((c) => c.name === 'Dolar');
        const eur = currencies.find((c) => c.name === 'Euro');
        const others = currencies.filter((c) => c.name !== 'Dolar' && c.name !== 'Euro');
        const first = [usd, eur].filter(Boolean);
        return { first, others };
    }, [currencies]);

    const editingExpense = selectedExpenses.find((e) => e.id === editingExpenseId);
    const selectedCategoriesNames = useMemo(() => selectedCategories.map((c) => c.customName || c.name), [selectedCategories]);
    const expenseCategoryOptions = useMemo(() => {
        const base = [...selectedCategoriesNames];
        if (editingExpense && editingExpense.selectedCategoryName && !base.includes(editingExpense.selectedCategoryName)) {
            base.push(editingExpense.selectedCategoryName);
        }
        return base;
    }, [selectedCategoriesNames, editingExpense]);
    const isEditingExpenseMonthly = !!(editingExpense && expenseTypes.find((type) => type.id === editingExpense.expenseTypeId && String(type.name).toLowerCase() === 'monthly'));

    const toggleCurrency = (currencyId) => {
        setSelectedCurrencyIds((prev) => {
            const exists = prev.includes(currencyId);
            const next = exists ? prev.filter((id) => id !== currencyId) : [...prev, currencyId];
            if (!next.includes(defaultCurrencyId)) {
                setDefaultCurrencyId(next.length ? String(next[0]) : '');
            }
            return next;
        });
    };

    const toggleCategory = (category) => {
        setSelectedCategories((prev) => {
            const exists = prev.find((c) => c.id === category.id);
            if (exists) {
                return prev.filter((c) => c.id !== category.id);
            }
            return [...prev, { ...category, customName: category.name }];
        });
    };

    const updateCategoryName = (categoryId, name) => {
        setSelectedCategories((prev) => prev.map((c) => c.id === categoryId ? { ...c, customName: name } : c));
    };

    const toggleExpense = (expense) => {
        setSelectedExpenses((prev) => {
            const exists = prev.find((e) => e.id === expense.id);
            if (exists) {
                return prev.filter((e) => e.id !== expense.id);
            }

            const defaultCategoryName = expense.default_category_name || 'Others';
            const defaultWizardCategory = wizardCategories.find((category) => category.name === defaultCategoryName);
            const hasDefaultCategory = selectedCategories.some((category) => (category.customName || category.name) === defaultCategoryName || category.name === defaultCategoryName);
            if (!hasDefaultCategory && defaultWizardCategory) {
                setSelectedCategories((prevCategories) => {
                    if (prevCategories.find((category) => category.id === defaultWizardCategory.id)) {
                        return prevCategories;
                    }
                    return [...prevCategories, { ...defaultWizardCategory, customName: defaultWizardCategory.name }];
                });
            }

            return [...prev, {
                ...expense,
                customName: t(expense.name),
                selectedCategoryName: defaultCategoryName,
                expenseTypeId: 3,
                expenseDueDate: new Date().toISOString(),
                expenseDueDay: 10,
                expenseAmounts: selectedCurrencyIds.filter((id) => !String(id).startsWith('custom_')).map((id) => ({ currency_id: id, amount: '0' }))
            }];
        });
    };

    const updateExpenseField = (expenseId, field, value) => {
        setSelectedExpenses((prev) => prev.map((e) => e.id === expenseId ? { ...e, [field]: value } : e));
    };

    const updateExpenseAmount = (expenseId, currencyId, amount) => {
        setSelectedExpenses((prev) => prev.map((e) => {
            if (e.id !== expenseId) return e;
            return {
                ...e,
                expenseAmounts: e.expenseAmounts.map((ea) => ea.currency_id === currencyId ? { ...ea, amount } : ea)
            };
        }));
    };

    const openExpenseEditor = (expenseId) => {
        setEditingExpenseId(expenseId);
        setShowExpenseEditModal(true);
    };

    const saveEditedExpense = () => {
        setShowExpenseEditModal(false);
    };

    const togglePaymentMethod = (method) => {
        setSelectedPaymentMethods((prev) => {
            const exists = prev.find((m) => m.id === method.id);
            if (exists) {
                const next = prev.filter((m) => m.id !== method.id);
                if (defaultPaymentMethodName === method.name) {
                    setDefaultPaymentMethodName(next[0] ? next[0].name : '');
                }
                return next;
            }
            const next = [...prev, { ...method, customName: method.name }];
            if (!defaultPaymentMethodName) setDefaultPaymentMethodName(method.name);
            return next;
        });
    };

    const saveWizard = async () => {
        if (isSavingWizard) {
            return;
        }
        try {
            setIsSavingWizard(true);
            const token = localStorage.getItem('token');
            const dbCurrencyIds = selectedCurrencyIds.filter((id) => !String(id).startsWith('custom_'));
            const defaultDbCurrencyId = String(defaultCurrencyId).startsWith('custom_') ? (dbCurrencyIds[0] || null) : defaultCurrencyId;
            await axios.post(`${API_BASE_URL}/wizard/complete`, {
                selectedCurrencyIds: dbCurrencyIds,
                defaultCurrencyId: defaultDbCurrencyId || null,
                selectedCategories,
                selectedExpenses,
                selectedPaymentMethods,
                defaultPaymentMethodName
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toastRef.current.show({ severity: 'success', summary: t('Success'), detail: t('Starting setup completed successfully'), life: 3000 });
            sessionStorage.removeItem('wizard_custom_currencies');
            setTimeout(() => router.push('/dashboard'), 800);
        } catch (error) {
            console.error('Error completing wizard setup:', error);
            toastRef.current.show({ severity: 'error', summary: t('Error'), detail: t('Error completing wizard setup'), life: 3000 });
        } finally {
            setIsSavingWizard(false);
        }
    };

    const addCustomCurrency = () => {
        if (!customCurrencyName || !customCurrencySymbol) {
            return;
        }
        const customId = `custom_${Date.now()}`;
        setCustomCurrencies((prev) => [...prev, { id: customId, name: customCurrencyName, symbol: customCurrencySymbol }]);
        setSelectedCurrencyIds((prev) => [...prev, customId]);
        setCustomCurrencyName('');
        setCustomCurrencySymbol('');
        setShowCurrencyModal(false);
    };

    const addCustomCategory = () => {
        if (!customCategoryName) {
            return;
        }
        const newCategory = {
            id: `custom_category_${Date.now()}`,
            name: customCategoryName,
            icon: customCategoryIcon,
            active: 1,
            sort_order: 999
        };
        setWizardCategories((prev) => [...prev, newCategory]);
        setSelectedCategories((prev) => [...prev, { ...newCategory, customName: customCategoryName }]);
        setCustomCategoryName('');
        setCustomCategoryIcon('bi-tag');
        setShowCategoryModal(false);
    };

    const addCustomExpense = () => {
        if (!customExpenseName) {
            return;
        }
        const categoryName = customExpenseCategory || selectedCategoriesNames[0] || 'Others';
        const newExpense = {
            id: `custom_expense_${Date.now()}`,
            name: customExpenseName,
            default_category_name: categoryName,
            active: 1,
            sort_order: 999
        };
        setWizardExpenses((prev) => [...prev, newExpense]);
        setSelectedExpenses((prev) => [...prev, {
            ...newExpense,
            customName: customExpenseName,
            selectedCategoryName: categoryName,
            expenseTypeId: 3,
            expenseDueDate: new Date().toISOString(),
            expenseDueDay: 10,
            expenseAmounts: selectedCurrencyIds.filter((id) => !String(id).startsWith('custom_')).map((id) => ({ currency_id: id, amount: '0' }))
        }]);
        setCustomExpenseName('');
        setCustomExpenseCategory('');
        setShowExpenseModal(false);
    };

    const addCustomPaymentMethod = () => {
        if (!customPaymentMethodName) {
            return;
        }
        const newMethod = {
            id: `custom_payment_method_${Date.now()}`,
            name: customPaymentMethodName,
            customName: customPaymentMethodName,
            is_credit: customPaymentMethodIsCredit,
            active: 1,
            sort_order: 999
        };
        setWizardPaymentMethods((prev) => [...prev, newMethod]);
        setSelectedPaymentMethods((prev) => [...prev, newMethod]);
        if (!defaultPaymentMethodName) {
            setDefaultPaymentMethodName(customPaymentMethodName);
        }
        setCustomPaymentMethodName('');
        setCustomPaymentMethodIsCredit(false);
        setShowPaymentMethodModal(false);
    };

    return (
        <LayoutApp>
            <Head>
                <title>{`Wizard Setup | ${WEBSITE_NAME}`}</title>
            </Head>
            <Toast ref={toastRef} position="top-center" />
            <AppPageHeader eyebrow="Guided setup" title={t('Wizard Setup')} description="Configure the essentials for your tracker." />
            <div className={styles.wizardCard}>
                {isLoadingWizard && <Loading small={true} />}
                {!isLoadingWizard && (
                <>
                <div className={styles.stepHeader}>{t(STEPS[step])}</div>
                <div className={styles.stepSubtext}>{t('Step')} {step + 1} {t('of')} {STEPS.length}</div>

                {step === 0 && (
                    <>
                        <Dialog header={t('Add Currency')} visible={showCurrencyModal} onHide={() => setShowCurrencyModal(false)} style={{ width: '30rem' }}>
                            <div className={styles.inlineField}>
                                <label className={styles.inlineLabel}>{t('Name')}</label>
                                <input className={styles.inlineInput} value={customCurrencyName} onChange={(e) => setCustomCurrencyName(e.target.value)} />
                            </div>
                            <div className={styles.inlineField}>
                                <label className={styles.inlineLabel}>{t('Symbol')}</label>
                                <input className={styles.inlineInput} value={customCurrencySymbol} onChange={(e) => setCustomCurrencySymbol(e.target.value)} />
                            </div>
                            <div className={styles.inlineField}>
                                <Button label={t('Add')} onClick={addCustomCurrency} />
                            </div>
                        </Dialog>

                        <div className={styles.optionsGrid}>
                            {orderedMainCurrencies.first.map((currency) => {
                                const selected = selectedCurrencyIds.includes(currency.id);
                                return (
                                    <div key={currency.id} className={`${styles.optionCard} ${selected ? styles.selected : ''}`} onClick={() => toggleCurrency(currency.id)}>
                                        {currency.name} ({currency.symbol})
                                    </div>
                                );
                            })}
                            <div className={styles.separatorRow}>{t('Other currencies')}</div>
                            {orderedMainCurrencies.others.map((currency) => {
                                const selected = selectedCurrencyIds.includes(currency.id);
                                return (
                                    <div key={currency.id} className={`${styles.optionCard} ${selected ? styles.selected : ''}`} onClick={() => toggleCurrency(currency.id)}>
                                        {currency.name} ({currency.symbol})
                                    </div>
                                );
                            })}
                            {customCurrencies.map((currency) => {
                                const selected = selectedCurrencyIds.includes(currency.id);
                                return (
                                    <div key={currency.id} className={`${styles.optionCard} ${selected ? styles.selected : ''}`} onClick={() => toggleCurrency(currency.id)}>
                                        {currency.name} ({currency.symbol})
                                    </div>
                                );
                            })}
                            <div className={styles.addCard} onClick={() => setShowCurrencyModal(true)}>
                                <span>+</span> {t('Add Currency')}
                            </div>
                        </div>
                        <div className={styles.defaultWrap}>
                            <label className={styles.inlineLabel}>{t('Default Currency')}</label>
                            <select className={styles.inlineSelect} value={defaultCurrencyId} onChange={(e) => setDefaultCurrencyId(e.target.value)}>
                                {selectedCurrencyIds.map((currencyId) => {
                                    const currency = currencies.find((c) => c.id === currencyId) || customCurrencies.find((c) => c.id === currencyId);
                                    return <option key={currencyId} value={currencyId}>{currency ? `${currency.name} (${currency.symbol})` : currencyId}</option>;
                                })}
                            </select>
                        </div>
                    </>
                )}

                {step === 1 && (
                    <>
                    <Dialog header={t('Add Category')} visible={showCategoryModal} onHide={() => setShowCategoryModal(false)} style={{ width: '30rem' }}>
                        <div className={styles.inlineField}>
                            <label className={styles.inlineLabel}>{t('Name')}</label>
                            <input className={styles.inlineInput} value={customCategoryName} onChange={(e) => setCustomCategoryName(e.target.value)} />
                        </div>
                        <div className={styles.inlineField}>
                            <label className={styles.inlineLabel}>{t('Icon')}</label>
                            <input className={styles.inlineInput} value={customCategoryIcon} onChange={(e) => setCustomCategoryIcon(e.target.value)} />
                        </div>
                        <div className={styles.inlineField}><Button label={t('Add')} onClick={addCustomCategory} /></div>
                    </Dialog>
                    <div className={styles.optionsGrid}>
                        {wizardCategories.map((category) => {
                            const selected = selectedCategories.find((c) => c.id === category.id);
                            return (
                                <div key={category.id} className={`${styles.optionCard} ${selected ? styles.selected : ''}`} onClick={() => toggleCategory(category)}>
                                    <div className={styles.optionCardLabel} onClick={(e) => {
                                        if (selected) {
                                            e.stopPropagation();
                                            setEditingCategoryId(category.id);
                                        }
                                    }}>
                                        <i className={`bi ${category.icon || 'bi-tag'}`}></i>
                                        {selected && editingCategoryId === category.id ? (
                                            <input
                                                className={styles.inlineEditName}
                                                autoFocus
                                                value={selected.customName || ''}
                                                onChange={(e) => updateCategoryName(category.id, e.target.value)}
                                                onBlur={() => setEditingCategoryId(null)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span className={selected ? styles.editableTextInline : ''}>{selected ? (selected.customName || category.name) : category.name}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div className={styles.addCard} onClick={() => setShowCategoryModal(true)}><span>+</span> {t('Add Category')}</div>
                    </div>
                    </>
                )}

                {step === 2 && (
                    <>
                    <div className={styles.expenseStepMessage}>
                        {t('Select your starter expenses, then click the edit icon to personalize each one: name, category, frequency, due date, and amounts. You can also finish this setup now and update any expense later from the Expenses list.')}
                    </div>
                    <Dialog header={t('Add Expense')} visible={showExpenseModal} onHide={() => setShowExpenseModal(false)} style={{ width: '30rem' }}>
                        <div className={styles.inlineField}>
                            <label className={styles.inlineLabel}>{t('Name')}</label>
                            <input className={styles.inlineInput} value={customExpenseName} onChange={(e) => setCustomExpenseName(e.target.value)} />
                        </div>
                        <div className={styles.inlineField}>
                            <label className={styles.inlineLabel}>{t('Category')}</label>
                            <select className={styles.inlineSelect} value={customExpenseCategory} onChange={(e) => setCustomExpenseCategory(e.target.value)}>
                                <option value="">{t('Select a Category')}</option>
                                {selectedCategoriesNames.map((name) => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                        <div className={styles.inlineField}><Button label={t('Add')} onClick={addCustomExpense} /></div>
                    </Dialog>
                    <Dialog header={t('Edit Expense')} visible={showExpenseEditModal} onHide={() => setShowExpenseEditModal(false)} style={{ width: '38rem' }}>
                        {editingExpense && (
                            <div className={styles.expenseEditModalBody}>
                                <div className={styles.inlineField}>
                                    <label className={styles.inlineLabel}>{t('Custom Name')}</label>
                                    <input className={styles.inlineInput} value={editingExpense.customName} onChange={(e) => updateExpenseField(editingExpense.id, 'customName', e.target.value)} />
                                </div>
                                <div className={styles.inlineField}>
                                    <label className={styles.inlineLabel}>{t('Category')}</label>
                                    <select className={styles.inlineSelect} value={editingExpense.selectedCategoryName || ''} onChange={(e) => updateExpenseField(editingExpense.id, 'selectedCategoryName', e.target.value)}>
                                        {expenseCategoryOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                </div>
                                <div className={styles.inlineField}>
                                    <label className={styles.inlineLabel}>{t('Frequency')}</label>
                                    <select className={styles.inlineSelect} value={editingExpense.expenseTypeId} onChange={(e) => updateExpenseField(editingExpense.id, 'expenseTypeId', parseInt(e.target.value, 10))}>
                                        {expenseTypes.map((type) => <option key={type.id} value={type.id}>{t(type.name)}</option>)}
                                    </select>
                                </div>
                                {isEditingExpenseMonthly ? (
                                    <div className={styles.inlineField}>
                                        <label className={styles.inlineLabel}>{t('Due day')}</label>
                                        <input type="number" min={1} max={28} className={styles.inlineInput} value={editingExpense.expenseDueDay || ''} onChange={(e) => updateExpenseField(editingExpense.id, 'expenseDueDay', parseInt(e.target.value, 10))} />
                                    </div>
                                ) : (
                                    <div className={styles.inlineField}>
                                        <label className={styles.inlineLabel}>{t('Due date')}</label>
                                        <DatePicker
                                            selected={editingExpense.expenseDueDate ? new Date(editingExpense.expenseDueDate) : new Date()}
                                            onChange={(date) => updateExpenseField(editingExpense.id, 'expenseDueDate', date ? date.toISOString() : new Date().toISOString())}
                                            dateFormat="dd/MM/yyyy"
                                            className={styles.inlineInput}
                                        />
                                    </div>
                                )}
                                <div className={styles.amountsSection}>
                                    <div className={styles.amountsSectionTitle}>{t('Amount')}</div>
                                {editingExpense.expenseAmounts.map((ea) => {
                                    const currency = currencies.find((c) => c.id === ea.currency_id);
                                    return (
                                        <div key={`${editingExpense.id}_${ea.currency_id}`} className={styles.amountRow}>
                                            <div className={styles.amountCurrencyName}>{currency ? `${currency.name} (${currency.symbol})` : ea.currency_id}</div>
                                            <input
                                                className={styles.inlineInput}
                                                type="number"
                                                value={ea.amount}
                                                onFocus={(e) => {
                                                    if (String(ea.amount) === '0') {
                                                        updateExpenseAmount(editingExpense.id, ea.currency_id, '');
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value === '') {
                                                        updateExpenseAmount(editingExpense.id, ea.currency_id, '0');
                                                    }
                                                }}
                                                onChange={(e) => updateExpenseAmount(editingExpense.id, ea.currency_id, e.target.value)}
                                            />
                                        </div>
                                    );
                                })}
                                </div>
                                <div className={styles.expenseEditActions}>
                                    <Button label={t('Save')} onClick={saveEditedExpense} />
                                </div>
                            </div>
                        )}
                    </Dialog>
                    <div className={styles.optionsGrid}>
                        {wizardExpenses.map((expense) => {
                            const selected = selectedExpenses.find((e) => e.id === expense.id);
                            return (
                                <div key={expense.id} className={`${styles.optionCard} ${selected ? styles.selected : ''}`} onClick={() => toggleExpense(expense)}>
                                    <div className={styles.optionCardLabel}>{t(expense.name)}</div>
                                    {selected && <button type="button" className={styles.editExpenseButton} onClick={(e) => { e.stopPropagation(); openExpenseEditor(expense.id); }}><i className="bi bi-pencil-square"></i></button>}
                                </div>
                            );
                        })}
                        <div className={styles.addCard} onClick={() => setShowExpenseModal(true)}><span>+</span> {t('Add Expense')}</div>
                    </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <Dialog header={t('Add Payment Method')} visible={showPaymentMethodModal} onHide={() => setShowPaymentMethodModal(false)} style={{ width: '30rem' }}>
                            <div className={styles.inlineField}>
                                <label className={styles.inlineLabel}>{t('Name')}</label>
                                <input className={styles.inlineInput} value={customPaymentMethodName} onChange={(e) => setCustomPaymentMethodName(e.target.value)} />
                            </div>
                            <div className={styles.inlineField}>
                                <label className={styles.inlineLabel}>{t('Is Credit')}</label>
                                <select className={styles.inlineSelect} value={customPaymentMethodIsCredit ? '1' : '0'} onChange={(e) => setCustomPaymentMethodIsCredit(e.target.value === '1')}>
                                    <option value="0">{t('No')}</option>
                                    <option value="1">{t('Yes')}</option>
                                </select>
                            </div>
                            <div className={styles.inlineField}><Button label={t('Add')} onClick={addCustomPaymentMethod} /></div>
                        </Dialog>
                        <div className={styles.optionsGrid}>
                            {wizardPaymentMethods.map((paymentMethod) => {
                                const selected = selectedPaymentMethods.find((m) => m.id === paymentMethod.id);
                                return (
                                    <div key={paymentMethod.id} className={`${styles.optionCard} ${selected ? styles.selected : ''}`} onClick={() => togglePaymentMethod(paymentMethod)}>
                                        {paymentMethod.name}
                                    </div>
                                );
                            })}
                            <div className={styles.addCard} onClick={() => setShowPaymentMethodModal(true)}><span>+</span> {t('Add Payment Method')}</div>
                        </div>
                        <div className={styles.defaultWrap}>
                            <label className={styles.inlineLabel}>{t('Default Payment Method')}</label>
                            <select className={styles.inlineSelect} value={defaultPaymentMethodName} onChange={(e) => setDefaultPaymentMethodName(e.target.value)}>
                                {selectedPaymentMethods.map((method) => <option key={method.id} value={method.customName || method.name}>{method.customName || method.name}</option>)}
                            </select>
                        </div>
                    </>
                )}

                <div className={styles.sectionNav}>
                    <button className={styles.arrowButton} disabled={step === 0} onClick={() => setStep((s) => Math.max(s - 1, 0))}>←</button>
                    <span className={styles.sectionIndex}>{step + 1}/{STEPS.length}</span>
                    {step < STEPS.length - 1 ? (
                        <button className={styles.arrowButton} onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}>→</button>
                    ) : (
                        <button className={styles.arrowButton} disabled>→</button>
                    )}
                </div>
                {step === STEPS.length - 1 && (
                    <div className={styles.saveButtonRow}>
                        <div className={styles.saveButton}>
                            <Button label={isSavingWizard ? t('Saving...') : t('Complete Setup')} onClick={saveWizard} />
                        </div>
                        {isSavingWizard && (
                            <div className={styles.saveSpinner}>
                                <ProgressSpinner style={{ width: '26px', height: '26px' }} strokeWidth="6" />
                            </div>
                        )}
                    </div>
                )}
                </>
                )}
            </div>
        </LayoutApp>
    );
}

export default withAuth(WizardSetupPage);
