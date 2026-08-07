import React, { useEffect, useState } from 'react';
import styles from './Payments.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from "next/router";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import FormInput from "@/Components/UI/Form/FormInput";
import FormSelect from "@/Components/UI/Form/FormSelect";
import DatePicker from "react-datepicker";
import { FormActionBar, FormShell } from '@/Components/UI/Form/FormLayout';

const PaymentsForm = ({ paymentId, defaultExpenseId }) => {
    const { t } = useTranslation();

    const getDefaultPaymentMethodId = (methods) => {
        if (!methods || !methods.length) {
            return '';
        }
        const defaultMethod = methods.find((method) => method.is_default === 1);
        return defaultMethod ? defaultMethod.id : methods[0].id;
    };

    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentComment, setPaymentComment] = useState('');
    const [paymentExpense, setPaymentExpense] = useState('');
    const [paymentExpenseAmount, setPaymentExpenseAmount] = useState('');
    const [paymentExpenseAmountList, setPaymentExpenseAmonuntList] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentMethods, setPaymentMethods] = useState(null);
    const [expenses, setExpenses] = useState(null);
    const [amountError, setAmountError] = useState('');
    const [dateError, setDateError] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date());

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (paymentId) {
            axios
                .get(`${API_BASE_URL}/getPayment?paymentId=` + paymentId, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    if (response.data && response.data.payment) {
                        const payment = response.data.payment;
                        const expenses = response.data.expenses;
                        setPaymentAmount(payment.amount);
                        setPaymentComment(payment.comment);
                        setPaymentExpense(payment.expense_id);
                        const expense = expenses && expenses.find((expense) => expense.id === parseInt(payment.expense_id));
                        setPaymentExpenseAmonuntList(expense && expense.expense_amounts);
                        setPaymentExpenseAmount(payment.expense_amount_id);
                        setPaymentMethod(payment.payment_method_id);
                        setExpenses(response.data.expenses);
                        setPaymentMethods(response.data.paymentMethods);
                        setPaymentDate(new Date(payment.created_at));
                        if (!payment.payment_method_id) {
                            setPaymentMethod(getDefaultPaymentMethodId(response.data.paymentMethods));
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        } else {
            axios
                .get(`${API_BASE_URL}/newPaymentData`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    if (response.data) {
                        setExpenses(response.data.expenses);
                        setPaymentMethods(response.data.paymentMethods);
                        setPaymentMethod(getDefaultPaymentMethodId(response.data.paymentMethods));
                        if (defaultExpenseId && response.data.expenses) {
                            const expenseIdStr = String(defaultExpenseId);
                            setPaymentExpense(expenseIdStr);
                            const expense = response.data.expenses.find(
                                (e) => e.id === parseInt(defaultExpenseId, 10)
                            );
                            if (expense && expense.expense_amounts) {
                                setPaymentExpenseAmonuntList(expense.expense_amounts);
                                if (expense.expense_amounts.length > 0) {
                                    setPaymentExpenseAmount(expense.expense_amounts[0].id);
                                }
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [paymentId, defaultExpenseId]);

    const validateAmount = () => {
        if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
            setAmountError(t('Amount must be a number greater than 0'));
            return false;
        }
        setAmountError('');
        return true;
    };
    const validatePaymentDate = () => {
        if (!paymentDate || isNaN(paymentDate.getTime())) {
            setDateError(t('Due date is required and must be a valid date'));
            return false;
        }
        setDateError('');
        return true;
    }
    const router = useRouter();
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        var notificationMessage;
        const isAmountValid = validateAmount();
        if (isAmountValid) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(
                    `${API_BASE_URL}/newPayment`,
                    {
                        id: paymentId || null,
                        amount: paymentAmount,
                        comment: paymentComment,
                        expenseId: paymentExpense,
                        expenseAmountId: paymentExpenseAmount,
                        paymentMethod: paymentMethod,
                        paymentDate: paymentDate
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (paymentId) {
                    notificationMessage = t('Payment updated successfully');
                } else {
                    notificationMessage = t('Payment created successfully');
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
                router.push('/payments');
            } catch (error) {
                if (paymentId) {
                    notificationMessage = t('Error updating the Payment');
                } else {
                    notificationMessage = t('Error creating the Payment');
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
                router.push('/payments');
            }
        }
    };
    const deletePayment = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/deletePayment`,
                {
                    id: paymentId
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
                    detail: t('Payment deleted successfully'),
                    life: 3000
                })
            );
            router.push('/payments');
        } catch (error) {
            localStorage.setItem(
                'notification',
                JSON.stringify({
                    severity: 'error',
                    summary: t('Error'),
                    detail: t('Error deleting the Payment'),
                    life: 3000
                })
            );
            router.push('/payments');
        }
    }
    const handleDelete = () => {
        confirmDialog({
            message: t('Do you want to delete this payment?'),
            header: t('Delete Confirmation'),
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: deletePayment
        });
    }
    const setExpense = (expenseId) => {
        setPaymentExpense(expenseId);
        const expense = expenses.find((expense) => expense.id === parseInt(expenseId));
        setPaymentExpenseAmonuntList(expense.expense_amounts);
    }

    return (
        <div>
            <ConfirmDialog />
            <FormShell><form onSubmit={handleFormSubmit}>
                <div className={styles.formWrapper}>
                    <FormInput
                        label={t('Amount')}
                        type={'number'}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        onBlur={validateAmount}
                        errorMessage={amountError}
                    />
                    <FormSelect
                        label={t('Payment Method')}
                        values={paymentMethods}
                        valueLabel={'name'}
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        hideDefault={true}
                    />
                    <label className={styles.formInputLabelDate}>{t('Payment Date')}</label>
                    <DatePicker
                        selected={paymentDate}
                        onChange={(date) => setPaymentDate(date)}
                        onBlur={validatePaymentDate}
                        dateFormat="dd/MM/yyyy"
                    />
                    <div className={styles.inputError}>{dateError}</div>
                    <FormInput
                        label={t('Comment')}
                        type={'text'}
                        value={paymentComment}
                        onChange={(e) => setPaymentComment(e.target.value)}
                    />
                    <FormSelect
                        label={t('Expenses')}
                        values={expenses}
                        valueLabel={'name'}
                        value={paymentExpense}
                        onChange={(e) => setExpense(e.target.value)}
                        defaultLabel={t('Select an Expense')}
                    />
                    <FormSelect
                        label={t('Expenses Amount')}
                        values={paymentExpenseAmountList}
                        valueLabel={'name'}
                        multipleValueLabel={['currency_name', 'currency_symbol', 'amount']}
                        value={paymentExpenseAmount}
                        onChange={(e) => setPaymentExpenseAmount(e.target.value)}
                        defaultLabel={t('Select an Expense Amount')}
                    />
                </div>
                <FormActionBar editing={Boolean(paymentId)} onCancel={() => router.push('/payments')} onDelete={handleDelete} createLabel="Create Payment" updateLabel="Update Payment" />
            </form></FormShell>
        </div>
    );
};

export default PaymentsForm;
