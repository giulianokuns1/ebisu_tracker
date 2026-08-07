import React, { useEffect, useState } from 'react';
import styles from './PaymentMethods.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import axios from "axios";
import { API_BASE_URL } from "@/constants";
import { useRouter } from "next/router";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import 'react-datepicker/dist/react-datepicker.css';
import { InputSwitch } from "primereact/inputswitch";
import FormSelect from "@/Components/UI/Form/FormSelect";
import { FormActionBar, FormShell } from '@/Components/UI/Form/FormLayout';

const PaymentMethodsForm = ({ paymentMethodId }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [isCredit, setIsCredit] = useState(false);
    const [description, setDescription] = useState('');
    const [dueDateDay, setDueDateDay] = useState('1');
    const [statementDateDay, setStatementDateDay] = useState('1');
    const [expense, setExpense] = useState('');
    const [currencies, setCurrencies] = useState([]);
    const [currenciesList, setCurrenciesList] = useState([]);
    const [paymentMethodType, setPaymentMethodType] = useState('');
    const [paymentMethodTypeList, setPaymentMethodTypeList] = useState([]);
    const [creditPaymentType, setCreditPaymentType] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isDefault, setIsDefault] = useState(false);
    const router = useRouter();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (paymentMethodId) {
            axios
                .get(`${API_BASE_URL}/getPaymentMethod?id=` + paymentMethodId, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    if (response.data && response.data.paymentMethod) {
                        var selectedCurrencies = [];
                        const paymentMethod = response.data.paymentMethod;
                        setName(paymentMethod.name);
                        setIsCredit(paymentMethod.is_credit === 1);
                        setDescription(paymentMethod.description);
                        setDueDateDay(paymentMethod.due_date_day);
                        setExpense(paymentMethod.expense_id);
                        setStatementDateDay(paymentMethod.statement_date_day);
                        setIsDefault(paymentMethod.is_default === 1);
                        setPaymentMethodType(paymentMethod.payment_type_id);
                        setCurrenciesList(response.data.currencies);
                        setPaymentMethodTypeList(response.data.paymentMethodTypes);
                        setCreditPaymentType(response.data.creditPaymentType);
                        setIsEditing(true);
                        if (response.data.selectedCurrencies) {
                            response.data.selectedCurrencies.forEach(currency => {
                                const currencyToAdd = response.data.currencies.find(c => c.id === currency.id);
                                selectedCurrencies.push(currencyToAdd);
                            });
                            setCurrencies(selectedCurrencies);
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        } else {
            axios
                .get(`${API_BASE_URL}/getPaymentMethodFormData`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    if (response.data && response.data.currencies) {
                        setCurrenciesList(response.data.currencies);
                        setPaymentMethodTypeList(response.data.paymentMethodTypes);
                        setCreditPaymentType(response.data.creditPaymentType);
                        // Set default payment method type from response data directly
                        if (response.data.paymentMethodTypes && response.data.paymentMethodTypes.length && response.data.paymentMethodTypes[0].id) {
                            const defaultTypeId = response.data.paymentMethodTypes[0].id;
                            setPaymentMethodType(defaultTypeId);
                            // Set isCredit based on whether the default type is a credit type
                            if (response.data.creditPaymentType) {
                                setIsCredit(parseInt(defaultTypeId, 10) === response.data.creditPaymentType.id);
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [paymentMethodId]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (name && (!isCredit || (isCredit && dueDateDay && statementDateDay)) && paymentMethodType) {
                const token = localStorage.getItem('token');
                const response = await axios.post(`${API_BASE_URL}/newPaymentMethod`, {
                    name: name,
                    isCredit: isCredit,
                    description: description,
                    dueDateDay: dueDateDay,
                    expenseId: expense || null,
                    currencies: currencies,
                    statementDateDay: statementDateDay,
                    paymentMethodType: paymentMethodType,
                    isDefault: isDefault,
                    id: paymentMethodId || null,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                router.push('/paymentMethods');
            }
        } catch (error) {
            console.error('Error creating paymentMethod:', error);
        }
    };

    const deletePaymentMethod = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/deletePaymentMethod`,
                {
                    id: paymentMethodId
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
                    detail: t('Payment Method deleted successfully'),
                    life: 3000
                })
            );
            router.push('/paymentMethods');
        } catch (error) {
            localStorage.setItem(
                'notification',
                JSON.stringify({
                    severity: 'error',
                    summary: t('Error'),
                    detail: t('Error deleting the Payment Method'),
                    life: 3000
                })
            );
            router.push('/paymentMethods');
        }
    }

    const handleDelete = () => {
        confirmDialog({
            message: t('Do you want to delete this Payment Method?'),
            header: t('Delete Confirmation'),
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: deletePaymentMethod
        });
    }

    const handleChangePaymentMethodType = (newPaymentMethodType) => {
        if (isEditing && isCredit && parseInt(newPaymentMethodType, 10) !== creditPaymentType.id) {
            confirmDialog({
                message: (
                    <div>
                        <div>{t('Are you sure?')}</div>
                        <div>{t('All expenses, categories, and payments asociated to this payment method will be deleted too.')}</div>
                    </div>
                ),
                header: t('Modify Confirmation'),
                icon: 'pi pi-info-circle',
                acceptClassName: 'p-button-danger',
                accept: changeIsCredit.bind(this, newPaymentMethodType, parseInt(newPaymentMethodType, 10) === creditPaymentType.id)
            });
        } else {
            changeIsCredit(newPaymentMethodType, parseInt(newPaymentMethodType, 10) === creditPaymentType.id);
        }
    }

    const changeIsCredit = (newPaymentMethodType, isCreditValue) => {
        setPaymentMethodType(newPaymentMethodType);
        setIsCredit(isCreditValue);
    }

    const setCurrency = (currency) => {
        if (currencies.includes(currency)) {
            setCurrencies(currencies.filter(c => c !== currency));
        } else {
            setCurrencies([...currencies, currency]);
        }
    }

    return (
        <div>
            <ConfirmDialog />
            <FormShell><form onSubmit={handleFormSubmit}>
                <div className={styles.formWrapper}>
                    <div className={styles.formInputWrapper}>
                        <label className={styles.formInputLabel}>{t('Name')}</label>
                        <input
                            className={styles.inputText}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={styles.formInputWrapper}>
                        <label className={styles.formInputLabel}>{t('Description')}</label>
                        <input
                            className={styles.inputText}
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <FormSelect
                        label={t('Payment Method Type')}
                        values={paymentMethodTypeList}
                        valueLabel={'name'}
                        value={paymentMethodType}
                        onChange={(e) => handleChangePaymentMethodType(e.target.value)}
                        hideDefault={true}
                    />
                    <div className={styles.formInputWrapperCheckbox}>
                        <label className={styles.checkboxLabel}>{t('Default')}</label>
                        <InputSwitch
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.value)}
                            className={styles.checkboxInput}
                        />
                    </div>
                    {/*<div className={styles.formInputWrapperCheckbox}>*/}
                    {/*    <label className={styles.checkboxLabel}>{t('Is Credit')}</label>*/}
                    {/*    <InputSwitch*/}
                    {/*        checked={isCredit}*/}
                    {/*        onChange={handleChangeIsCreditCard}*/}
                    {/*        className={styles.checkboxInput}*/}
                    {/*    />*/}
                    {/*</div>*/}
                    <div className={isCredit ? styles.formInputWrapper : styles.inputDisabled}>
                        <label className={styles.formInputLabel}>{t('Due Date Day')}</label>
                        <div className={styles.selectWrapper}>
                            <select
                                className={styles.inputText}
                                value={dueDateDay || ''}
                                onChange={(e) => setDueDateDay(e.target.value)}
                                disabled={!isCredit}
                            >
                                <option value="" disabled>
                                    {t('Select the Due Date Day')}
                                </option>
                                {
                                    Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                        <option key={day} value={day}>
                                            {day}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                    <div className={isCredit ? styles.formInputWrapper : styles.inputDisabled}>
                        <label className={styles.formInputLabel}>{t('Statement Date Day')}</label>
                        <div className={styles.selectWrapper}>
                            <select
                                className={styles.inputText}
                                value={statementDateDay || ''}
                                onChange={(e) => setStatementDateDay(e.target.value)}
                                disabled={!isCredit}
                            >
                                <option value="" disabled>
                                    {t('Select the Statement Date Day')}
                                </option>
                                {
                                    Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                        <option key={day} value={day}>
                                            {day}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                    {isCredit && currenciesList && (
                        <div>
                            <label className={styles.formInputLabel}>{t('Currencies')}</label>
                            <div className={styles.currenciesSelectContainer}>
                                {currenciesList.map(currency => (
                                    <div
                                        key={currency.id}
                                        className={styles.currencySelectContainer}
                                    >
                                        <InputSwitch
                                            checked={currencies && currencies.includes(currency)}
                                            onChange={() => setCurrency(currency)}
                                            className={styles.checkboxInput}
                                        />
                                        <div
                                            className={styles.currencySelectName}>{currency.symbol} {currency.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <FormActionBar editing={Boolean(paymentMethodId)} onCancel={() => router.push('/paymentMethods')} onDelete={handleDelete} createLabel="Create Payment Method" updateLabel="Update Payment Method" />
            </form></FormShell>
        </div>
    );
};

export default PaymentMethodsForm;
