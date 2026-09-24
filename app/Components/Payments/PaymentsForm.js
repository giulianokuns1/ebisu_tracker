import React, { useEffect, useState } from 'react';
import styles from './Payments.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from "next/router";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import DatePicker from "react-datepicker";
import { FormActionBar, FormShell } from '@/Components/UI/Form/FormLayout';
import Loading from '@/Components/UI/Loading';

const PaymentsForm = ({ paymentId, defaultExpenseId, returnTo = '/payments' }) => {
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
    const [paymentExpenseAmountList, setPaymentExpenseAmonuntList] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentMethods, setPaymentMethods] = useState(null);
    const [expenses, setExpenses] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amountError, setAmountError] = useState('');
    const [allocationError, setAllocationError] = useState('');
    const [dateError, setDateError] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date());
    const [creditPurchases, setCreditPurchases] = useState([]);
    const [allocations, setAllocations] = useState({});

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
                })
                .finally(() => setLoading(false));
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
                })
                .finally(() => setLoading(false));
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
    const validateAllocations = () => {
        if (!isCardStatement) {
            setAllocationError('');
            return true;
        }
        const total = Object.values(allocations).reduce((sum, value) => sum + Number(value || 0), 0);
        if (total > Number(paymentAmount || 0) + 0.001) {
            setAllocationError(t('The payment amount must be equal to or greater than the total allocated amount.'));
            return false;
        }
        setAllocationError('');
        return true;
    };
    const router = useRouter();
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        var notificationMessage;
        const isAmountValid = validateAmount();
        const areAllocationsValid = validateAllocations();
        if (isAmountValid && areAllocationsValid) {
            try {
                const token = localStorage.getItem('token');
                if (!paymentId && isCardStatement) {
                    const response = await axios.post(
                        `${API_BASE_URL}/createExpensePayment`,
                        {
                            expense: {
                                ...selectedExpense,
                                expense_amount_id: paymentExpenseAmount,
                                amount: selectedAmount?.amount,
                                paymentTotal: selectedAmount?.paymentTotal,
                            },
                            amount: paymentAmount,
                            comment: paymentComment,
                            paymentMethod,
                            paymentDate,
                            isFullPaid: Number(paymentAmount) >= Number(selectedAmount?.amount || 0),
                            allocations: Object.entries(allocations)
                                .map(([expenseAmountId, allocationAmount]) => ({ statementExpenseAmountId: paymentExpenseAmount, expenseAmountId, amount: allocationAmount }))
                                .filter((allocation) => Number(allocation.amount) > 0),
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    notificationMessage = t('Payment created successfully');
                    localStorage.setItem('notification', JSON.stringify({ severity: 'success', summary: t('Success'), detail: notificationMessage, life: 3000 }));
                    router.replace(returnTo);
                    return;
                }
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
                router.replace(returnTo);
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
                router.replace(returnTo);
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
        setPaymentExpenseAmount(expense.expense_amounts?.[0]?.id || '');
        const firstAmount = expense.expense_amounts?.[0];
        setPaymentAmount(firstAmount ? String(Math.max(0, Number(firstAmount.amount || 0) - Number(firstAmount.paymentTotal || 0))) : '');
        setCreditPurchases([]);
        setAllocations({});
    }
    const selectedExpense = expenses?.find((expense) => Number(expense.id) === Number(paymentExpense));
    const selectedAmount = paymentExpenseAmountList?.find((amount) => Number(amount.id) === Number(paymentExpenseAmount));
    const selectedMethod = paymentMethods?.find((method) => Number(method.id) === Number(paymentMethod));
    const isCardStatement = Boolean(selectedExpense?.payment_method_id) && !selectedExpense?.is_credit_card_purchase;
    const formatDate = paymentDate && !isNaN(paymentDate.getTime()) ? paymentDate.toLocaleDateString() : t('Not set');

    useEffect(() => {
        if (!isCardStatement || !selectedAmount?.currency_id) {
            setCreditPurchases([]);
            setAllocations({});
            return;
        }
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/creditPurchaseAllocations`, {
            params: { paymentMethodId: selectedExpense.payment_method_id, currencyId: selectedAmount.currency_id },
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            const purchases = response.data.purchases || [];
            setCreditPurchases(purchases);
            setAllocations(Object.fromEntries(purchases.map((purchase) => [
                purchase.expense_amount_id,
                Number(purchase.remaining || 0) ? String(purchase.remaining) : '',
            ])));
        }).catch(() => {
            setCreditPurchases([]);
            setAllocations({});
        });
    }, [isCardStatement, selectedExpense?.payment_method_id, selectedAmount?.currency_id]);

    useEffect(() => {
        if (!isCardStatement || paymentAmount || !selectedAmount) return;
        setPaymentAmount(String(Math.max(0, Number(selectedAmount.amount || 0) - Number(selectedAmount.paymentTotal || 0))));
    }, [isCardStatement, selectedAmount, paymentAmount]);

    if (loading) return <Loading />;

    return (
        <div>
            <ConfirmDialog />
            <FormShell className={styles.paymentShell}><form onSubmit={handleFormSubmit} className={styles.paymentEditor}>
                <div className={styles.paymentFormCard}>
                    <PaymentStep number="1" title={t('Linked Expense')} hint={t('Link this payment to an existing expense.')}><div className={styles.linkedFields}><label><span>{t('Expense')}</span><select value={paymentExpense || ''} onChange={(event) => setExpense(event.target.value)}><option value="">{t('Select an Expense')}</option>{(expenses || []).map((expense) => <option key={expense.id} value={expense.id}>{expense.name}</option>)}</select></label><label><span>{t('Expenses Amount')}</span><select value={paymentExpenseAmount || ''} onChange={(event) => setPaymentExpenseAmount(event.target.value)} disabled={!paymentExpense}><option value="">{t('Select an Expense Amount')}</option>{(paymentExpenseAmountList || []).map((amount) => <option key={amount.id} value={amount.id}>{amount.currency_symbol} {amount.currency_name} {amount.amount}</option>)}</select></label></div></PaymentStep>
                    <PaymentStep number="2" title={t('Amount')} hint={t('How much was paid?')}><div className={styles.amountFields}><label><span>{t('Amount')}</span><input type="number" min="0" step="0.01" value={paymentAmount ?? ''} onChange={(event) => setPaymentAmount(event.target.value)} onBlur={validateAmount} onWheel={(event) => event.currentTarget.blur()} /></label></div>{amountError && <div className={styles.inputError}>{amountError}</div>}</PaymentStep>
                    {isCardStatement && creditPurchases.length > 0 && <PaymentStep number="3" title={t('Allocate to credit purchases')} hint={t('Choose how this statement payment is applied.')}><div className={styles.creditAllocationSection}>{creditPurchases.map((purchase) => <div className={styles.creditAllocationRow} key={purchase.expense_amount_id}><span>{purchase.name}<small>{purchase.currency_symbol} {Number(purchase.remaining).toFixed(2)} {t('remaining')}</small></span><input className={styles.creditAllocationInput} type="number" min="0" max={purchase.remaining} step="0.01" value={allocations[purchase.expense_amount_id] ?? ''} onChange={(event) => { setAllocations((current) => ({ ...current, [purchase.expense_amount_id]: event.target.value })); setAllocationError(''); }} /></div>)}{allocationError && <div className={styles.inputError}>{allocationError}</div>}</div></PaymentStep>}
                    <PaymentStep number={isCardStatement && creditPurchases.length > 0 ? "4" : "3"} title={t('Payment Method')} hint={t('What method did you use?')}><div className={styles.methodCards}>{(paymentMethods || []).map((method) => <button type="button" key={method.id} className={Number(paymentMethod) === Number(method.id) ? styles.methodSelected : ''} onClick={() => setPaymentMethod(method.id)}><i className={`bi ${method.is_credit ? 'bi-credit-card' : 'bi-wallet2'}`} aria-hidden="true" /><span>{method.name}</span></button>)}</div></PaymentStep>
                    <PaymentStep number={isCardStatement && creditPurchases.length > 0 ? "5" : "4"} title={t('Payment Date')} hint={t('When was this payment made?')}><div className={styles.paymentDateField}><DatePicker selected={paymentDate} onChange={setPaymentDate} onBlur={validatePaymentDate} dateFormat="dd/MM/yyyy" popperClassName={styles.datePickerPopper} popperPlacement="bottom-start" /><div className={styles.inputError}>{dateError}</div></div></PaymentStep>
                    <PaymentStep number={isCardStatement && creditPurchases.length > 0 ? "6" : "5"} title={t('Comment')} optional hint={t('Add any additional notes.')}><textarea value={paymentComment ?? ''} maxLength={500} placeholder={t('Add a comment...')} onChange={(event) => setPaymentComment(event.target.value)} /><small className={styles.characterCount}>{paymentComment?.length || 0}/500</small></PaymentStep>
                </div>
                <aside className={styles.paymentSummary}><h2>{t('Payment Summary')}</h2><p>{t("Here's how this payment will be recorded.")}</p><div className={styles.summaryList}><SummaryRow icon="bi-cash-coin" label={t('Amount')} value={`${selectedAmount?.currency_symbol || ''} ${Number(paymentAmount || 0).toFixed(2)}`} /><SummaryRow icon="bi-credit-card" label={t('Payment Method')} value={selectedMethod?.name || t('Not set')} /><SummaryRow icon="bi-calendar3" label={t('Payment Date')} value={formatDate} /><SummaryRow icon="bi-house" label={t('Linked Expense')} value={selectedExpense?.name || t('Not set')} /><SummaryRow icon="bi-currency-exchange" label={t('Currency')} value={selectedAmount ? `${selectedAmount.currency_symbol} ${selectedAmount.currency_name}` : t('Not set')} /><SummaryRow icon="bi-chat-left-text" label={t('Comment')} value={paymentComment || t('No comment')} /></div><div className={styles.summaryHint}><i className="bi bi-info-circle" aria-hidden="true" />{t('This payment will be saved and reflected in your payment history and expense tracking.')}</div></aside>
                <div className={styles.paymentActions}><FormActionBar editing={Boolean(paymentId)} onCancel={() => router.push(returnTo)} onDelete={handleDelete} createLabel={t('Create Payment')} updateLabel={t('Update Payment')} /></div>
            </form></FormShell>
        </div>
    );
};

const PaymentStep = ({ number, title, hint, optional, children }) => <section className={styles.paymentStep}><header><span>{number}</span><div><h2>{title}{optional && <small>{' '}({optional === true ? 'Optional' : optional})</small>}</h2><p>{hint}</p></div></header>{children}</section>;
const SummaryRow = ({ icon, label, value }) => <div className={styles.summaryRow}><i className={`bi ${icon}`} aria-hidden="true" /><span>{label}</span><strong>{value}</strong></div>;

export default PaymentsForm;
