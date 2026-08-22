import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FormSelect from '@/Components/UI/Form/FormSelect';
import { API_BASE_URL } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import useModalBackButton from '@/Hooks/useModalBackButton';
import styles from './QuickActions.module.scss';

const defaultPaymentMethod = (methods) => methods?.find((method) => method.is_default === 1)?.id || methods?.[0]?.id || '';

export default function QuickActions() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [data, setData] = useState(null);
    const [expenseId, setExpenseId] = useState('');
    const [amountId, setAmountId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [amount, setAmount] = useState('');
    const [comment, setComment] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date());
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const closePayment = useModalBackButton(paymentOpen, () => setPaymentOpen(false));

    useEffect(() => {
        const closeOnEscape = (event) => { if (event.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, []);

    const openPayment = async () => {
        setOpen(false);
        setError('');
        setPaymentOpen(true);
        if (data) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/newPaymentData`, { headers: { Authorization: `Bearer ${token}` } });
            setData(response.data);
            setPaymentMethod(defaultPaymentMethod(response.data.paymentMethods));
        } catch (requestError) {
            setError(requestError.response?.data?.error || t('Unable to load payment options.'));
        }
    };

    const selectedExpense = data?.expenses?.find((expense) => String(expense.id) === String(expenseId));
    const amounts = selectedExpense?.expense_amounts || [];
    const selectExpense = (event) => {
        const id = event.target.value;
        const expense = data.expenses.find((item) => String(item.id) === String(id));
        const firstAmount = expense?.expense_amounts?.[0];
        setExpenseId(id);
        setAmountId(firstAmount?.id || '');
        setAmount(firstAmount?.amount || '');
    };
    const selectAmount = (event) => {
        const id = event.target.value;
        const expenseAmount = amounts.find((item) => String(item.id) === String(id));
        setAmountId(id);
        setAmount(expenseAmount?.amount || '');
    };
    const savePayment = async (event) => {
        event.preventDefault();
        if (!expenseId || !amountId || !paymentMethod || !Number(amount) || !paymentDate) {
            setError(t('Complete the payment details.'));
            return;
        }
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/newPayment`, { amount, comment, expenseId, expenseAmountId: amountId, paymentMethod, paymentDate }, { headers: { Authorization: `Bearer ${token}` } });
            closePayment();
            setAmount('');
            setComment('');
        } catch (requestError) {
            setError(requestError.response?.data?.error || t('Unable to save payment.'));
        } finally {
            setSaving(false);
        }
    };

    return <div className={styles.container}>
        {open && <div className={styles.menu} role="menu"><button type="button" role="menuitem" onClick={openPayment}><i className="bi bi-cash-coin" aria-hidden="true" />{t('Add Payment')}</button><Link href="/expenses/create" role="menuitem" onClick={() => setOpen(false)}><i className="bi bi-receipt" aria-hidden="true" />{t('Add Expense')}</Link></div>}
        <button type="button" className={`${styles.fab} ${open ? styles.open : ''}`} onClick={() => setOpen((value) => !value)} aria-label={t('Quick actions')} aria-expanded={open}><i className={`bi ${open ? 'bi-x-lg' : 'bi-plus-lg'}`} aria-hidden="true" /></button>
        <Dialog header={t('Add Payment')} visible={paymentOpen} onHide={closePayment} className={styles.dialog} style={{ width: '420px' }} breakpoints={{ '600px': 'calc(100vw - 24px)' }}>
            <form className={styles.form} onSubmit={savePayment}>
                <FormSelect label={t('Expense')} values={data?.expenses || []} valueLabel="name" value={expenseId} onChange={selectExpense} defaultLabel={t('Select an expense')} />
                <FormSelect label={t('Currency amount')} values={amounts} valueLabel="currency_symbol" multipleValueLabel={['currency_symbol', 'currency_name']} value={amountId} onChange={selectAmount} defaultLabel={t('Select a currency')} />
                <FormSelect label={t('Payment Method')} values={data?.paymentMethods || []} valueLabel="name" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} defaultLabel={t('Select a payment method')} />
                <label>{t('Amount')}<input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
                <label>{t('Payment Date')}<DatePicker selected={paymentDate} onChange={setPaymentDate} dateFormat="dd/MM/yyyy" /></label>
                <label>{t('Comment')}<input value={comment} onChange={(event) => setComment(event.target.value)} /></label>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.actions}><button type="button" onClick={closePayment}>{t('Cancel')}</button><button type="submit" disabled={saving}>{t(saving ? 'Saving...' : 'Add Payment')}</button></div>
            </form>
        </Dialog>
    </div>;
}
