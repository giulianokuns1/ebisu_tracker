import React, { useEffect, useState } from 'react';
import styles from './Budgets.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from "next/router";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import FormInput from "@/Components/UI/Form/FormInput";
import FormActionsButton from "@/Components/UI/Form/FormActionsButton";
import FormSelect from "@/Components/UI/Form/FormSelect";

const BudgetsForm = ({ budgetId }) => {
    const { t } = useTranslation();

    const [budgetName, setBudgetName] = useState('');
    const [budgetAmount, setBudgetAmount] = useState('');
    const [budgetCurrency, setBudgetCurrency] = useState('');
    const [budgetCategory, setBudgetCategory] = useState('');
    const [budgetBudgetType, setBudgetBudgetType] = useState('');
    const [budgetsTypes, setBudgetsTypes] = useState(null);
    const [currencies, setCurrencies] = useState(null);
    const [categories, setCategories] = useState(null);
    const [nameError, setNameError] = useState('');
    const [amountError, setAmountError] = useState('');
    const [categoryError, setCategoryError] = useState('');
    const [currencyError, setCurrencyError] = useState('');
    const [typeError, setTypeError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios
            .get(`${API_BASE_URL}/newBudgetData`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                setCategories(response.data.categories);
                setBudgetsTypes(response.data.budgetsTypes);
                setCurrencies(response.data.currencies);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
        if (budgetId) {
            axios
                .get(`${API_BASE_URL}/getBudget?budgetId=` + budgetId, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    if (response.data && response.data.budget) {
                        const budget = response.data.budget;
                        setBudgetName(budget.name);
                        setBudgetAmount(budget.amount);
                        setBudgetCategory(budget.category_id);
                        setBudgetCurrency(budget.currency_id);
                        setBudgetBudgetType(budget.type_id);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [budgetId]);

    const validateName = () => {
        if (!budgetName) {
            setNameError(t('Name is required'));
            return false;
        }
        setNameError('');
        return true;
    };
    const validateAmount = () => {
        if (!budgetAmount || isNaN(budgetAmount) || parseFloat(budgetAmount) <= 0) {
            setAmountError(t('Amount must be a number greater than 0'));
            return false;
        }
        setAmountError('');
        return true;
    };
    const validateCategory = () => {
        if (!budgetCategory) {
            setCategoryError(t('Category is required'));
            return false;
        }
        setCategoryError('');
        return true;
    };
    const validateCurrency = () => {
        if (!budgetCurrency) {
            setCurrencyError(t('Currency is required'));
            return false;
        }
        setCurrencyError('');
        return true;
    };

    const validateType = () => {
        if (!budgetBudgetType) {
            setTypeError(t('Frequency is required'));
            return false;
        }
        setTypeError('');
        return true;
    };

    const router = useRouter();
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        var notificationMessage;
        const isNameValid = validateName();
        const isAmountValid = validateAmount();
        const isCurrencyValid = validateCurrency();
        const isCategoryValid = validateCategory();
        const isTypeValid = validateType();
        if (isNameValid && isAmountValid && isCategoryValid && isTypeValid && isCurrencyValid) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(
                    `${API_BASE_URL}/newBudget`,
                    {
                        id: budgetId || null,
                        name: budgetName,
                        amount: budgetAmount,
                        currency: budgetCurrency,
                        category: budgetCategory,
                        budgetType: budgetBudgetType
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (budgetId) {
                    notificationMessage = t('Budget updated successfully');
                } else {
                    notificationMessage = t('Budget created successfully');
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
                router.push('/budgets');
            } catch (error) {
                if (budgetId) {
                    notificationMessage = t('Error updating the Budget');
                } else {
                    notificationMessage = t('Error creating the Budget');
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
                router.push('/budgets');
            }
        }
    };
    const deleteBudget = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/deleteBudget`,
                {
                    id: budgetId
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
                    detail: t('Budget deleted successfully'),
                    life: 3000
                })
            );
            router.push('/budgets');
        } catch (error) {
            localStorage.setItem(
                'notification',
                JSON.stringify({
                    severity: 'error',
                    summary: t('Error'),
                    detail: t('Error deleting the Budget'),
                    life: 3000
                })
            );
            router.push('/budgets');
        }
    }
    const handleDelete = (event, budgetId) => {
        event.preventDefault();
        confirmDialog({
            message: t('Do you want to delete this budget?'),
            header: t('Delete Confirmation'),
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: deleteBudget
        });
    }
    return (
        <div>
            <ConfirmDialog />
            <form onSubmit={handleFormSubmit}>
                <div className={styles.formWrapper}>
                    <FormInput
                        label={t('Name')}
                        type={'text'}
                        value={budgetName}
                        onChange={(e) => setBudgetName(e.target.value)}
                        onBlur={validateName}
                        errorMessage={nameError}
                    />
                    <FormInput
                        label={t('Amount')}
                        type={'number'}
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        onBlur={validateAmount}
                        errorMessage={amountError}
                    />
                    <FormSelect
                        label={t('Currency')}
                        values={currencies}
                        valueLabel={'name'}
                        value={budgetCurrency}
                        onChange={(e) => setBudgetCurrency(e.target.value)}
                        defaultLabel={t('Select a Currency')}
                        onBlur={validateCurrency}
                        errorMessage={currencyError}
                    />
                    <FormSelect
                        label={t('Categories')}
                        values={categories}
                        valueLabel={'name'}
                        value={budgetCategory}
                        onChange={(e) => setBudgetCategory(e.target.value)}
                        defaultLabel={t('Select a Category')}
                        onBlur={validateCategory}
                        errorMessage={categoryError}
                    />
                    <FormSelect
                        label={t('Frequency')}
                        values={budgetsTypes}
                        valueLabel={'name'}
                        value={budgetBudgetType}
                        onChange={(e) => setBudgetBudgetType(e.target.value)}
                        defaultLabel={t('Select an Frequency')}
                        onBlur={validateType}
                        errorMessage={typeError}
                    />
                </div>
                <FormActionsButton id={budgetId} label={t(' budget')} type={'submit'} deleteMethod={handleDelete} />
            </form>
        </div>
    );
};

export default BudgetsForm;
