import styles from './Expenses.module.scss';
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from '@/Hooks/useTranslation';
import axios from "axios";
import { API_BASE_URL } from "@/constants";
import { Dialog } from 'primereact/dialog';
import Button from "@/Components/UI/Button";
import { Toast } from "primereact/toast";
import FormSelect from "@/Components/UI/Form/FormSelect";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import FormCheckbox from "@/Components/UI/Form/Checkbox/FormCheckbox";
import { useRouter } from 'next/router';
import useModalBackButton from '@/Hooks/useModalBackButton';

const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};
const getRemainingAmount = (amountRecord) => Math.max(0, toNumber(amountRecord?.amount) - toNumber(amountRecord?.paymentTotal));

const ExpensesPayment = ({ expense, onAddExpensePayment, isGrid, isNextMonth, fullWidthButton, renderTrigger, initialAmount, initialPaymentDate }) => {
    const { t } = useTranslation();
    const router = useRouter();

    const getDefaultPaymentMethodId = () => {
        if (!expense || !expense.paymentMethods || !expense.paymentMethods.length) {
            return '';
        }
        const defaultMethod = expense.paymentMethods.find((method) => method.is_default === 1);
        return defaultMethod ? defaultMethod.id : expense.paymentMethods[0].id;
    };

    const today = new Date();
    if (isNextMonth) {
        today.setMonth(today.getMonth() + 1);
    }

    const [modalVisible, setModalVisible] = useState(false);
    const [amount, setAmount] = useState('');
    const [amounts, setAmounts] = useState({});
    const [expenseAmount, setExpenseAmount] = useState(expense?.expense_amounts?.[0]?.id || expense?.expense_amount_id || '');
    const [dateError, setDateError] = useState('');
    const [comment, setComment] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(getDefaultPaymentMethodId());
    const [amountError, setAmountError] = useState('');
    const notificationToast = useRef(null);
    const [paymentDate, setPaymentDate] = useState(today);
    const [isFullPaid, setIsFullPaid] = useState(false);
    const closePaymentModal = useModalBackButton(modalVisible, () => setModalVisible(false));
    const expenseAmounts = expense?.currencyAmounts || expense?.expense_amounts || [];
    const isMultiCurrency = expenseAmounts.length > 1;

    useEffect(() => {
        if (!expense || !expense.paymentMethods || !expense.paymentMethods.length) {
            setPaymentMethod('');
            return;
        }
        const defaultMethod = expense.paymentMethods.find((method) => method.is_default === 1);
        setPaymentMethod(defaultMethod ? defaultMethod.id : expense.paymentMethods[0].id);
    }, [expense]);

    useEffect(() => {
        if (initialPaymentDate) setPaymentDate(initialPaymentDate);
    }, [initialPaymentDate]);

    useEffect(() => {
        const defaultExpenseAmount = expense?.expense_amounts?.[0];
        const amountRecord = defaultExpenseAmount || (expense?.expense_amount_id ? { id: expense.expense_amount_id, amount: expense.amount, paymentTotal: expense.paymentTotal } : null);
        setExpenseAmount(amountRecord?.id || '');
        setAmount(amountRecord ? String(getRemainingAmount(amountRecord)) : '');
        setAmounts(Object.fromEntries(expenseAmounts.map((record) => [record.expense_amount_id || record.id, String(getRemainingAmount(record))])));
    }, [expense]);

    const validateAmount = () => {
        const hasPayment = isMultiCurrency ? Object.values(amounts).some((value) => Number(value) > 0) : Number(amount) > 0;
        if (!hasPayment) {
            setAmountError(t('Amount must be a number greater than 0'));
            return false;
        }
        setAmountError('');
        return true;
    };
    const selectedExpenseAmount = expense && expense.expense_amounts && expenseAmount
        ? expense.expense_amounts.find((ea) => parseInt(ea.id, 10) === parseInt(expenseAmount, 10))
        : expense && expense.expense_amounts && expense.expense_amounts[0];
    const displayCurrencySymbol = selectedExpenseAmount ? (selectedExpenseAmount.currency_symbol || expense.currency_symbol) : (expense && expense.currency_symbol);

    const createExpensePayment = async () => {
        if (!validateAmount() || !validatePaymentDate()) return;
        var notificationData;
        try {
            const expenseForRequest = expense
                ? {
                    ...expense,
                    expense_amount_id: selectedExpenseAmount?.id || expense.expense_amount_id,
                    amount: selectedExpenseAmount ? selectedExpenseAmount.amount : expense.amount,
                    paymentTotal: selectedExpenseAmount ? selectedExpenseAmount.paymentTotal : expense.paymentTotal
                }
                : expense;
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/createExpensePayment`,
                {
                    expense: expenseForRequest,
                    amount: amount,
                    amounts: isMultiCurrency ? expenseAmounts.map((record) => ({
                        expenseAmountId: record.expense_amount_id || record.id,
                        amount: amounts[record.expense_amount_id || record.id] || 0,
                        originalAmount: record.amount,
                        isFullPaid: Number(amounts[record.expense_amount_id || record.id] || 0) >= Number(record.amount || 0),
                    })) : undefined,
                    comment: comment,
                    paymentMethod: paymentMethod,
                    paymentDate: paymentDate,
                    isFullPaid: isFullPaid
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            notificationData = {
                severity: 'success',
                summary: t('Success'),
                detail: t('Payment added successfully'),
                life: 3000
            }
            closePaymentModal();
            setAmount('');
            setAmounts({});
            setComment('');
            onAddExpensePayment();
        } catch (error) {
            notificationData = {
                severity: 'error',
                summary: t('Error'),
                detail: t('Error adding the Payment'),
                life: 3000
            }
        }
        notificationToast.current.show(notificationData);
    }
    const handlePaymenet = () => {
        const amountRecord = selectedExpenseAmount || expense?.expense_amounts?.[0];
        const remaining = amountRecord
            ? getRemainingAmount(amountRecord)
            : getRemainingAmount(expense);
        setAmount(initialAmount !== undefined ? String(initialAmount) : (remaining ? String(remaining) : ''));
        setAmounts(Object.fromEntries(expenseAmounts.map((record) => [record.expense_amount_id || record.id, String(getRemainingAmount(record))])));
        setIsFullPaid(false);
        setModalVisible(true);
    }
    const handleFullPaid = (event) => {
        setIsFullPaid(event.value);
    }
    const validatePaymentDate = () => {
        if (!paymentDate || isNaN(paymentDate.getTime())) {
            setDateError(t('Due date is required and must be a valid date'));
            return false;
        }
        setDateError('');
        return true;
    }
    return (
        <div className={styles.paymentContainer}>
            <Toast ref={notificationToast} position={'top-center'} />
            <Dialog
                header={null}
                visible={modalVisible}
                onHide={closePaymentModal}
                className={styles.paymentDialog}
                style={{ width: '520px' }}
                breakpoints={{ '641px': 'calc(100vw - 24px)' }}
                closeOnEscape={true}
                dismissableMask={true}
            >
                <div className={styles.paymentModalContainer}>
                    <div className={styles.paymentModalIntro}>
                        <span>{t('Record payment')}</span>
                        <h2>{t(expense.name)}</h2>
                        <p className={isMultiCurrency ? styles.multiCurrencyRemaining : undefined}>{isMultiCurrency ? expenseAmounts.map((record) => <span key={record.expense_amount_id || record.id}>{record.currency_symbol || ''} {getRemainingAmount(record).toFixed(2)} {t('remaining')}</span>) : <>{displayCurrencySymbol || ''} {getRemainingAmount(selectedExpenseAmount || expense).toFixed(2)} {t('remaining')}</>}</p>
                    </div>
                    <div className={styles.formWrapper}>
                        <FormSelect
                            label={t('Payment Method')}
                            values={expense.paymentMethods}
                            valueLabel={'name'}
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            hideDefault={true}
                        />
                        {!isMultiCurrency && expense.expense_amounts && expense.expense_amounts.length > 1 && (
                            <FormSelect
                                label={t('Expense Amount')}
                                values={expense.expense_amounts}
                                valueLabel={'id'}
                                multipleValueLabel={['currency_symbol', 'currency_name', 'amount']}
                                value={expenseAmount}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    setExpenseAmount(id);
                                    const ea = expense.expense_amounts.find((a) => parseInt(a.id, 10) === parseInt(id, 10));
                                    if (ea) setAmount(String(getRemainingAmount(ea)));
                                }}
                                hideDefault={true}
                            />
                        )}
                        {isMultiCurrency ? <div className={styles.formInputWrapper}>
                            <label className={styles.formInputLabel}>{t('Paid Amounts')}</label>
                            <div className={styles.multiCurrencyPaymentRows}>{expenseAmounts.map((record) => {
                                const id = record.expense_amount_id || record.id;
                                return <div className={styles.paidAmountWrapper} key={id}><div className={styles.currencySymbol}>{record.currency_symbol || '—'}</div><input className={styles.amountInput} type="number" min="0" step="0.01" value={amounts[id] ?? ''} onChange={(event) => setAmounts((current) => ({ ...current, [id]: event.target.value }))} /><small>{(record.currency_symbol || '')} {getRemainingAmount(record).toFixed(2)} {t('remaining')}</small></div>;
                            })}</div>
                            <div className={styles.inputError}>{amountError}</div>
                        </div> : <div className={styles.formInputWrapper}>
                            <label className={styles.formInputLabel}>{t('Paid Amount')}</label>
                            <div className={styles.paidAmountWrapper}>
                                <div className={styles.currencySymbol}>{displayCurrencySymbol || '—'}</div>
                                <input className={styles.amountInput} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} onBlur={validateAmount} />
                            </div>
                            <div className={styles.inputError}>{amountError}</div>
                        </div>}
                        <div className={styles.formInputWrapper}>
                            <label className={styles.formInputLabel}>{t('Comment')}</label>
                            <input
                                className={styles.inputText}
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>
                        <label className={styles.formInputLabelDate}>{t('Payment Date')}</label>
                        <DatePicker
                            selected={paymentDate}
                            onChange={(date) => setPaymentDate(date)}
                            onBlur={validatePaymentDate}
                            dateFormat="dd/MM/yyyy"
                        />
                        <div className={styles.inputError}>{dateError}</div>
                        {!isMultiCurrency && <FormCheckbox
                            label={t('Full paid')}
                            checked={isFullPaid}
                            onChange={handleFullPaid}
                        />}
                    </div>
                    <div className={styles.paymentModalActions}>
                        <button type="button" className={styles.editExpenseButton} onClick={() => { closePaymentModal(); router.push(`/expenses/details/${expense.id}`); }}>{t('Edit expense')}</button>
                        <button type="button" className={styles.cancelPaymentButton} onClick={closePaymentModal}>{t('Cancel')}</button>
                        <Button label={t(isMultiCurrency ? 'Add Payments' : 'Add Payment')} customClass={styles.addPaymentButton} onClick={createExpensePayment} />
                    </div>
                </div>
            </Dialog>

            {renderTrigger && renderTrigger(handlePaymenet)}

            {!renderTrigger && fullWidthButton &&
                <div className={styles.addPaymentFullWidthTrigger} onClick={handlePaymenet}>
                    {t('Add Payment')}
                </div>
            }

            {!renderTrigger && !fullWidthButton && isGrid &&
                <div className={styles.actionsContainer} onClick={handlePaymenet}>
                    <div className={styles.actionsPay}>
                        <i className={`bi-credit-card-fill ${styles.paymentGridIcon}`}></i>
                    </div>
                </div>
            }

            {!renderTrigger && !fullWidthButton && !isGrid &&
                <div className={styles.actionsContainer} onClick={handlePaymenet}>
                    <div className={styles.actionsPay}>
                        <i className={`bi-credit-card-fill ${styles.paymentIcon}`}></i>
                    </div>
                    <div className={styles.actionsPayText}>{t('Pay')}</div>
                </div>
            }
        </div>
    );
};

export default ExpensesPayment;
