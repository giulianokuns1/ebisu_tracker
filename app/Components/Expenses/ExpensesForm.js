import React, { useEffect, useRef, useState } from 'react';
import styles from './Expenses.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from "next/router";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from "primereact/toast";
import { Dialog } from 'primereact/dialog';
import FormInput from "@/Components/UI/Form/FormInput";
import FormSelect from "@/Components/UI/Form/FormSelect";
import FormDate from "@/Components/UI/Form/FormDate";
import ExpenseAmounts from "@/Components/Expenses/ExpenseAmounts/ExpenseAmounts";
import { FormActionBar, FormSection, FormShell } from '@/Components/UI/Form/FormLayout';
import CheckboxList from "@/Components/UI/Form/Checkbox/CheckboxList";
import IconPicker from "@/Components/UI/IconPicker";
import CategoryColorPicker from '@/Components/Categories/CategoryColorPicker';
import categoryStyles from '@/Components/Categories/Categories.module.scss';

const ExpensesForm = ({ expenseId, expenseData, newExpenseData }) => {
    const { t } = useTranslation();
    const formatIconForSave = (icon) => {
        const cleanIcon = icon && icon.trim() ? icon.trim() : 'tag';
        return cleanIcon.startsWith('bi-') ? cleanIcon : `bi-${cleanIcon}`;
    };

    const [expenseName, setExpenseName] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseAmounts, setExpenseAmounts] = useState([]);
    const [expenseAmountToDelete, setExpenseAmountToDelete] = useState(null);
    const [expenseCategory, setExpenseCategory] = useState('');
    const [expenseType, setExpenseType] = useState('');
    const [expenseDueDate, setExpenseDueDate] = useState(new Date());
    const [expenseCurrency, setExpenseCurrency] = useState(null);
    const [expensesTypes, setExpensesTypes] = useState(null);
    const [expensePaymentMethod, setExpensePaymentMethod] = useState(null);
    const [categories, setCategories] = useState(null);
    const [currencies, setCurrencies] = useState(null);
    const [isScheduled, setIsScheduled] = useState(false);
    const [expenseDueDay, setExpenseDueDay] = useState(null);
    const [scheduledMonths, setScheduledMonths] = useState(null);
    const [monthCheckboxList, setMonthCheckboxList] = useState([]);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('tag');
    const [newCategoryColor, setNewCategoryColor] = useState('#4FD6BE');
    const [newCategoryNameError, setNewCategoryNameError] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);

    const [nameError, setNameError] = useState('');
    const [amountError, setAmountError] = useState('');
    const [categoryError, setCategoryError] = useState('');
    const [currencyError, setCurrencyError] = useState('');
    const [typeError, setTypeError] = useState('');
    const [dateError, setDateError] = useState('');
    const [dueDayError, setDueDayError] = useState('');
    const [scheduledMonthsError, setScheduledMonthsError] = useState('');
    const [paymentMethodError, setPaymentMethodError] = useState('');
    const notificationToast = useRef(null);
    const router = useRouter();
    const selectedExpenseTypeData = expensesTypes && expenseType
        ? expensesTypes.find((type) => String(type.id) === String(expenseType))
        : null;
    const isMonthlyFrequency = selectedExpenseTypeData
        ? String(selectedExpenseTypeData.name).toLowerCase() === 'monthly'
        : false;
    const selectedCategory = categories?.find((category) => String(category.id) === String(expenseCategory));
    const selectedCurrencyName = (currencyId) => currencies?.find((currency) => String(currency.id) === String(currencyId));

    useEffect(() => {
        const token = localStorage.getItem('token');
        setMonthCheckboxList([
            { 'name': 'January', 'value': '1', 'label': 'January', 'checked': false },
            { 'name': 'February', 'value': '2', 'label': 'February', 'checked': false },
            { 'name': 'March', 'value': '3', 'label': 'March', 'checked': false },
            { 'name': 'April', 'value': '4', 'label': 'April', 'checked': false },
            { 'name': 'May', 'value': '5', 'label': 'May', 'checked': false },
            { 'name': 'June', 'value': '6', 'label': 'June', 'checked': false },
            { 'name': 'July', 'value': '7', 'label': 'July', 'checked': false },
            { 'name': 'August', 'value': '8', 'label': 'August', 'checked': false },
            { 'name': 'September', 'value': '9', 'label': 'September', 'checked': false },
            { 'name': 'October', 'value': '10', 'label': 'October', 'checked': false },
            { 'name': 'November', 'value': '11', 'label': 'November', 'checked': false },
            { 'name': 'December', 'value': '12', 'label': 'December', 'checked': false },
        ]);
        if (expenseId && expenseData) {
            const expense = expenseData.expense;
            const expenseAmounts = expenseData.expenseAmounts;
            let expenseSchedule = [];
            setExpenseName(expense.name);
            setExpenseCategory(expense.category_id);
            setExpenseType(expense.type_id);
            setExpenseDueDate(new Date(expense.due_date));
            setExpenseDueDay(expense.due_date_day);
            setExpenseCurrency(expense.currency_id);
            setExpensePaymentMethod(expense.payment_method_id);
            if (expenseAmounts && expenseAmounts.length > 0) {
                setExpenseAmounts(expenseAmounts);
            }
            setExpensesTypes(expenseData.expensesTypes);
            setCategories(expenseData.categories);
            setCurrencies(expenseData.currencies);
            setIsScheduled(parseInt(expense.type_id, 10) === 2);
            if (expenseData.expenseSchedule) {
                expenseData.expenseSchedule.forEach((schedule) => {
                    setMonthCheckboxList((prevState) => {
                        const newState = [...prevState];
                        newState[schedule.month - 1].checked = true;
                        return newState;
                    });
                    expenseSchedule.push({
                        value: schedule.month,
                        checked: true
                    });
                });
                setScheduledMonths(expenseSchedule);
            }
        } else {
            setExpensesTypes(newExpenseData.expensesTypes);
            setCategories(newExpenseData.categories);
            setCurrencies(newExpenseData.currencies);
            if (newExpenseData.currencies && newExpenseData.currencies.length > 0) {
                setExpenseAmounts([
                    {
                        amount: 0,
                        currency_id: newExpenseData.currencies[0].id
                    }
                ]);
            }
        }
    }, [expenseData, expenseId, newExpenseData]);
    const validateName = () => {
        if (!expenseName) {
            setNameError(t('Name is required'));
            return false;
        }
        setNameError('');
        return true;
    };
    const validateAmount = () => {
        // Skip 0 validation if expense has a payment method (credit expenses)
        if (expensePaymentMethod) {
            setAmountError('');
            return true;
        }
        if (expenseAmounts && expenseAmounts.length > 0) {
            for (let i = 0; i < expenseAmounts.length; i++) {
                if (!expenseAmounts[i].amount || isNaN(expenseAmounts[i].amount) || parseFloat(expenseAmounts[i].amount) <= 0) {
                    setAmountError(t('Amount must be a number greater than 0'));
                    return false;
                }
            }
        }
        setAmountError('');
        return true;
    };
    const validateCurrency = () => {
        if (expenseAmounts && expenseAmounts.length > 0) {
            const currencies = expenseAmounts.map((amount) => amount.currency_id);
            const uniqueCurrencies = [...new Set(currencies)];
            if (uniqueCurrencies.length !== currencies.length) {
                setCurrencyError(t('All currencies must be different'));
                return false;
            }
        }
        setCurrencyError('');
        return true;
    };
    const validateCategory = (categoryValue = expenseCategory) => {
        if (!categoryValue) {
            setCategoryError(t('Category is required'));
            return false;
        }
        setCategoryError('');
        return true;
    };
    const validateType = () => {
        if (!expenseType) {
            setTypeError(t('Frequency is required'));
            return false;
        }
        setTypeError('');
        return true;
    };
    const validateDate = () => {
        if (!expenseDueDate || isNaN(expenseDueDate.getTime())) {
            setDateError(t('Due date is required and must be a valid date'));
            return false;
        }
        setDateError('');
        return true;
    };
    const validateDueDay = () => {
        const maxDueDay = isMonthlyFrequency ? 28 : 31;
        if ((isScheduled || isMonthlyFrequency) && (!expenseDueDay || isNaN(expenseDueDay))) {
            setDueDayError(t('Due day is required and must be a valid number'));
            return false;
        } else if ((isScheduled || isMonthlyFrequency) && (expenseDueDay < 1 || expenseDueDay > maxDueDay)) {
            setDueDayError(t(isMonthlyFrequency ? 'Due day must be between 1 and 28' : 'Due day must be between 1 and 31'));
            return false;
        }
        setDueDayError('');
        return true;
    };
    const validateScheduledMonths = () => {
        const selectedMonths = monthCheckboxList.filter((checkbox) => checkbox.checked);
        if (selectedMonths.length === 0) {
            setScheduledMonthsError(t('At least one month must be selected'));
            return false;
        }
        setScheduledMonthsError('');
        return true;
    };
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        let notificationMessage;
        const isNameValid = validateName();
        const isAmountValid = validateAmount();
        const isCurrencyValid = validateCurrency();
        const isCategoryValid = validateCategory();
        const isTypeValid = validateType();
        const isDateValid = validateDate();
        const isDueDayValid = validateDueDay();
        const isScheduledMonthsValid = validateScheduledMonths();

        let isValid =
            isNameValid &&
            isAmountValid &&
            isCategoryValid &&
            isTypeValid &&
            isCurrencyValid &&
            (
                (!isScheduled && !isMonthlyFrequency && isDateValid) ||
                (isMonthlyFrequency && isDueDayValid) ||
                (isScheduled && isScheduledMonthsValid)
            );

        if (isValid) {
            try {
                const token = localStorage.getItem('token');
                const fallbackCurrencyId = currencies && currencies.length ? currencies[0].id : null;
                const normalizedExpenseAmounts = (expenseAmounts || []).map((expenseAmount) => ({
                    ...expenseAmount,
                    currency_id: expenseAmount.currency_id || fallbackCurrencyId
                }));
                const response = await axios.post(
                    `${API_BASE_URL}/createExpense`,
                    {
                        id: expenseId || null,
                        name: expenseName,
                        category: expenseCategory,
                        expenseType: expenseType,
                        expenseDueDate: expenseDueDate,
                        expenseAmounts: normalizedExpenseAmounts,
                        scheduledMonths: scheduledMonths,
                        expenseDueDay: expenseDueDay,
                        expensePaymentMethod: expensePaymentMethod
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (expenseId) {
                    notificationMessage = t('Expense updated successfully');
                } else {
                    notificationMessage = t('Expense created successfully');
                }
                localStorage.setItem(
                    'notification',
                    JSON.stringify({
                        severity: 'success',
                        summary: t('Success'),
                        detail: notificationMessage,
                        life: 3000
                    })
                );
                router.push('/expenses');
            } catch (error) {
                if (expenseId) {
                    notificationMessage = t('Error updating the Expense');
                } else {
                    notificationMessage = t('Error creating the Expense');
                }
                localStorage.setItem(
                    'notification',
                    JSON.stringify({
                        severity: 'error',
                        summary: t('Error'),
                        detail: notificationMessage,
                        life: 3000
                    })
                );
                router.push('/expenses');
            }
        }
    };
    const deleteExpense = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/deleteExpense`,
                {
                    id: expenseId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            localStorage.setItem(
                'notification',
                JSON.stringify({
                    severity: 'success',
                    summary: t('Success'),
                    detail: t('Expense deleted successfully'),
                    life: 3000
                })
            );
            router.push('/expenses');
        } catch (error) {
            localStorage.setItem(
                'notification',
                JSON.stringify({
                    severity: 'error',
                    summary: t('Error'),
                    detail: t('Error deleting the Expense'),
                    life: 3000
                })
            );
            router.push('/expenses');
        }
    }
    const handleDelete = () => {
        confirmDialog({
            message: t('Do you want to delete this expense?'),
            header: t('Delete Confirmation'),
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: deleteExpense
        });
    }
    const handleAddExpenseAmount = (e) => {
        e.preventDefault();
        if (expenseAmounts && expenseAmounts.length < currencies.length) {
            setExpenseAmounts([...expenseAmounts, { amount: '', currency_id: getFirstAvailableCurrency() }]);
        }
    }
    const getFirstAvailableCurrency = () => {
        const availableCurrencies = currencies && currencies.filter((currency) => !isAddedCurrency(currency.id));
        if (availableCurrencies && availableCurrencies.length > 0) {
            return availableCurrencies[0].id;
        }
    }
    const isAddedCurrency = (currencyId) => {
        if (expenseAmounts && expenseAmounts.length > 0) {
            return expenseAmounts.some((amount) => amount.currency_id === currencyId);
        }
        return false;
    }
    const setExpenseAmountsAmount = (amount, index) => {
        const newExpenseAmounts = [...expenseAmounts];
        newExpenseAmounts[index].amount = amount;
        setExpenseAmounts(newExpenseAmounts);
    }
    const setExpenseAmountsCurrency = (currency, index) => {
        const newExpenseAmounts = [...expenseAmounts];
        newExpenseAmounts[index].currency_id = parseInt(currency, 10);
        setExpenseAmounts(newExpenseAmounts);
    }
    const handleDeleteExpenseAmount = (event, expenseAmountId, index) => {
        event.preventDefault();
        confirmDialog({
            message: t('Do you want to delete this?'),
            header: t('Delete Confirmation'),
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => deleteExpenseAmount(expenseAmountId, index)
        });
    }
    const deleteExpenseAmount = async (expenseAmountId, index) => {
        let notificationData;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/deleteExpenseAmount`,
                {
                    id: expenseAmountId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.data.error) {
                notificationData = {
                    severity: 'error',
                    summary: t('Error'),
                    detail: t(response.data.error),
                    life: 3000
                }
            } else {
                notificationData = {
                    severity: 'success',
                    summary: t('Success'),
                    detail: t('Amount removed successfully'),
                    life: 3000
                }
            }
            setExpenseAmounts(expenseAmounts.filter((amount, i) => i !== index));
        } catch (error) {
            notificationData = {
                severity: 'error',
                summary: t('Error'),
                detail: t('Error removing the amount'),
                life: 3000
            }
        }
        validateAmount();
        validateCurrency();
        notificationToast.current.show(notificationData);
    }
    const handleSelectFrequency = (e) => {
        let expenseTypeId;
        e.preventDefault();
        expenseTypeId = e.target.value;
        setIsScheduled(parseInt(expenseTypeId, 10) === 2);
        setExpenseType(expenseTypeId);

        if (expensesTypes && expensesTypes.length > 0) {
            const selectedType = expensesTypes.find((type) => String(type.id) === String(expenseTypeId));
            const monthlySelected = selectedType && String(selectedType.name).toLowerCase() === 'monthly';
            if (monthlySelected) {
                const day = expenseDueDate && !isNaN(expenseDueDate.getTime())
                    ? Math.min(expenseDueDate.getDate(), 28)
                    : 1;
                setExpenseDueDay(day);
            }
        }
    }
    const handleMonthlyDueDayChange = (e) => {
        const rawValue = e.target.value;
        if (rawValue === '') {
            setExpenseDueDay('');
            return;
        }

        const parsedDay = parseInt(rawValue, 10);
        const selectedDay = Math.min(Math.max(parsedDay, 1), 28);
        setExpenseDueDay(selectedDay);
        if (selectedDay && !isNaN(selectedDay)) {
            const newDate = expenseDueDate && !isNaN(expenseDueDate.getTime()) ? new Date(expenseDueDate) : new Date();
            newDate.setDate(selectedDay);
            setExpenseDueDate(newDate);
        }
    }
    const handleScheduledMonthsChange = (e) => {
        const checkedMonths = e.target.value;
        const month = e.target.name;
        let scheduledMonths;
        let updatedMonthList = monthCheckboxList.map((checkbox) => {
            if (checkbox.value === month) {
                checkbox.checked = checkedMonths;
            }
            return checkbox;
        });
        setMonthCheckboxList(updatedMonthList);
        scheduledMonths = updatedMonthList.filter((checkbox) => checkbox.checked);
        setScheduledMonths(scheduledMonths);
    }
    const openCreateCategoryModal = () => {
        setCategoryModalVisible(true);
    }
    const closeCreateCategoryModal = () => {
        setCategoryModalVisible(false);
        setNewCategoryName('');
        setNewCategoryIcon('tag');
        setNewCategoryColor('#4FD6BE');
        setNewCategoryNameError('');
    }
    const handleCategoryIconSelect = (icon) => {
        setNewCategoryIcon(icon);
    }
    const createCategory = async () => {
        if (!newCategoryName || !newCategoryName.trim()) {
            setNewCategoryNameError(t('Name is required'));
            return;
        }
        setNewCategoryNameError('');
        setCreatingCategory(true);
        try {
            const token = localStorage.getItem('token');
            const categoryIcon = formatIconForSave(newCategoryIcon);
            const response = await axios.post(`${API_BASE_URL}/newCategory`, {
                name: newCategoryName.trim(),
                icon: categoryIcon,
                color: newCategoryColor,
                id: null
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.data && response.data.category) {
                const createdCategory = response.data.category;
                setCategories((prevState) => prevState ? [...prevState, createdCategory] : [createdCategory]);
                setExpenseCategory(String(createdCategory.id));
                setCategoryError('');
                notificationToast.current.show({
                    severity: 'success',
                    summary: t('Success'),
                    detail: t('Category created successfully'),
                    life: 3000
                });
                closeCreateCategoryModal();
            }
        } catch (error) {
            notificationToast.current.show({
                severity: 'error',
                summary: t('Error'),
                detail: t('Error creating category'),
                life: 3000
            });
        } finally {
            setCreatingCategory(false);
        }
    }

    return (
        <div className={styles.expenseFormContainer}>
            <Toast ref={notificationToast} position={'top-center'} />
            <ConfirmDialog />
            <Dialog
                header={t('Create Category')}
                visible={categoryModalVisible}
                onHide={closeCreateCategoryModal}
                className={styles.categoryDialog}
                style={{ width: '920px', maxWidth: 'calc(100vw - 32px)' }}
                breakpoints={{ '640px': 'calc(100vw - 24px)' }}
                headerClassName={styles.categoryDialogHeader}
                closeOnEscape={true}
                dismissableMask={true}
            >
                <form className={styles.createCategoryModalContainer} onSubmit={(event) => { event.preventDefault(); createCategory(); }}>
                    <div className={categoryStyles.editorIntro}>
                        <div>
                            <label className={categoryStyles.nameField}>Category Name <span aria-hidden="true">*</span>
                                <div className={`${categoryStyles.nameInputWrap} ${newCategoryNameError ? categoryStyles.nameInputError : ''}`}>
                                    <input value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} onBlur={() => setNewCategoryNameError(newCategoryName.trim() ? '' : t('Name is required'))} aria-invalid={Boolean(newCategoryNameError)} autoFocus />
                                    {newCategoryName.trim() && <i className="bi bi-check-circle-fill" aria-hidden="true" />}
                                </div>
                                {newCategoryNameError && <small>{newCategoryNameError}</small>}
                            </label>
                            <div className={categoryStyles.nameColorControl}><CategoryColorPicker color={newCategoryColor} onChange={setNewCategoryColor} /></div>
                        </div>
                        <aside className={categoryStyles.previewCard}>
                            <p>{t('Preview')}</p>
                            <div className={categoryStyles.previewContent}>
                                <span className={categoryStyles.previewIcon} style={{ backgroundColor: `${newCategoryColor}33`, color: newCategoryColor }}><i className={`bi bi-${newCategoryIcon}`} aria-hidden="true" /></span>
                                <div><strong>{newCategoryName || t('Category Name')}</strong><small>{t('This is how it will appear in your categories.')}</small></div>
                            </div>
                        </aside>
                    </div>
                    <IconPicker categoryMode onSelect={handleCategoryIconSelect} selectedIcon={newCategoryIcon} />
                    <FormActionBar editing={false} onCancel={closeCreateCategoryModal} createLabel={creatingCategory ? t('Creating...') : t('Create Category')} />
                </form>
            </Dialog>
            <div className={styles.expenseEditorLayout}><FormShell><form onSubmit={handleFormSubmit}>
                <FormSection icon="bi-file-earmark-text" title="Basic Information"><div className={styles.expenseFieldsGrid}>
                    <FormInput
                        label={t('Name')}
                        type={'text'}
                        value={expenseName}
                        onChange={(e) => setExpenseName(e.target.value)}
                        onBlur={validateName}
                        errorMessage={nameError}
                    />
                    <div className={styles.categoryField}>
                        <FormSelect
                            label={t('Category')}
                            values={categories}
                            valueLabel={'name'}
                            value={expenseCategory}
                            onChange={(e) => {
                                const selectedCategory = e.target.value;
                                setExpenseCategory(selectedCategory);
                                validateCategory(selectedCategory);
                            }}
                            defaultLabel={t('Select a Category')}
                            onBlur={validateCategory}
                            errorMessage={categoryError}
                        />
                        <div className={styles.inlineCreateCategoryAction}>
                            <button
                                type="button"
                                className={styles.inlineCreateCategoryButton}
                                onClick={openCreateCategoryModal}
                            >
                                <i className={`bi-plus-circle ${styles.inlineCreateCategoryButtonIcon}`}></i>
                                {t('Create Category')}
                            </button>
                        </div>
                    </div>
                </div></FormSection>
                <FormSection icon="bi-calendar3" title="Schedule"><div className={styles.expenseFieldsGrid}>
                    <div><FormSelect
                        label={t('Frequency')}
                        values={expensesTypes}
                        valueLabel={'name'}
                        value={expenseType}
                        onChange={handleSelectFrequency}
                        defaultLabel={t('Select a Frequency')}
                        onBlur={validateType}
                        errorMessage={typeError}
                    /><small className={styles.fieldHint}><i className="bi bi-info-circle" aria-hidden="true" /> How often is this expense?</small></div>
                    {isScheduled && <div><FormInput label={t('Due day')} type={'number'} value={expenseDueDay} onChange={(e) => setExpenseDueDay(e.target.value)} onBlur={validateDueDay} errorMessage={dueDayError} min={1} max={31} /></div>}
                    {!isScheduled && !isMonthlyFrequency && <div><FormDate label={t('Due date')} value={expenseDueDate} onChange={(date) => setExpenseDueDate(date)} onBlur={validateDate} errorMessage={dateError} /></div>}
                    {!isScheduled && isMonthlyFrequency && <div><FormInput label={t('Due day')} type={'number'} value={expenseDueDay || ''} onChange={handleMonthlyDueDayChange} onBlur={validateDueDay} errorMessage={dueDayError} min={1} max={28} /></div>}
                    {isScheduled && <div className={styles.fullRow}><CheckboxList label={t('Months')} checkboxList={monthCheckboxList} onChange={handleScheduledMonthsChange} onBlur={validateScheduledMonths} errorMessage={scheduledMonthsError} /></div>}
                </div></FormSection>
                {expensePaymentMethod &&
                        <div className={styles.formInputWrapper}>
                            <div>{t('The total amount for each currency will be calculated based on the payments realized last month using this payment method.')}</div>
                            <div>{t('If you want to set a fixed amount for the current month, you can do it in the amount section.')}</div>
                        </div>
                    }
                <FormSection icon="bi-cash-stack" title="Amount & Currency"><ExpenseAmounts
                        expenseAmounts={expenseAmounts}
                        setExpenseAmountsAmount={setExpenseAmountsAmount}
                        setExpenseAmountsCurrency={setExpenseAmountsCurrency}
                        currencies={currencies}
                        validateAmount={validateAmount}
                        validateCurrency={validateCurrency}
                        amountError={amountError}
                        currencyError={currencyError}
                        handleDeleteExpenseAmount={handleDeleteExpenseAmount}
                        handleAddExpenseAmount={handleAddExpenseAmount}
                    /></FormSection>
                <FormActionBar editing={Boolean(expenseId)} onCancel={() => router.push('/expenses')} onDelete={handleDelete} createLabel="Create Expense" updateLabel="Update Expense" />
            </form></FormShell><aside className={styles.expenseSummary}><div className={styles.summaryHeader}><span><i className="bi bi-receipt" aria-hidden="true" /></span><h2>Expense Summary</h2></div><SummaryRow icon="bi-type" label="Name" value={expenseName || 'Not set'} /><SummaryRow icon="bi-tags" label="Category" value={selectedCategory?.name || 'Not set'} /><SummaryRow icon="bi-calendar3" label="Frequency" value={selectedExpenseTypeData?.name || 'Not set'} /><SummaryRow icon="bi-calendar-event" label="Due date" value={expenseDueDate ? expenseDueDate.toLocaleDateString() : 'Not set'} /><div className={styles.summaryAmounts}><span><i className="bi bi-currency-dollar" aria-hidden="true" /> Amount</span>{expenseAmounts?.length ? expenseAmounts.map((item, index) => { const currency = selectedCurrencyName(item.currency_id); return <strong key={`${item.currency_id}-${index}`}>{currency?.symbol || ''} {Number(item.amount || 0).toFixed(2)} <small>{currency?.name || ''}</small></strong>; }) : <strong>Not set</strong>}</div></aside></div>
        </div>
    );
};

export default ExpensesForm;

const SummaryRow = ({ icon, label, value }) => <div className={styles.summaryRow}><i className={`bi ${icon}`} aria-hidden="true" /><div><span>{label}</span><strong>{value}</strong></div></div>;
