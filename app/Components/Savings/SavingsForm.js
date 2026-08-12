import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { API_BASE_URL } from '@/constants';
import FormInput from '@/Components/UI/Form/FormInput';
import FormSelect from '@/Components/UI/Form/FormSelect';
import { FormActionBar, FormShell } from '@/Components/UI/Form/FormLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import styles from './Savings.module.scss';

export default function SavingsForm({ savingId }) {
    const { t } = useTranslation();
    const router = useRouter();
    const [values, setValues] = useState({ name: '', targetAmount: '', currencyId: '', comment: '', startingAmount: '' });
    const [currencies, setCurrencies] = useState([]);
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/newSavingData`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => setCurrencies(response.data.currencies || []));
        if (savingId) axios.get(`${API_BASE_URL}/getSaving?savingId=${savingId}`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => { const saving = response.data.saving; if (saving) setValues({ name: saving.name || '', targetAmount: saving.target_amount || '', currencyId: saving.currency_id || '', comment: saving.comment || '', startingAmount: '' }); });
        if (savingId) {
            axios.get(`${API_BASE_URL}/getSavings`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => {
                setTransactions((response.data.transactions || []).filter((transaction) => String(transaction.saving_id) === String(savingId)));
            });
        }
    }, [savingId]);
    const update = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));
    const save = async (event) => { event.preventDefault(); const token = localStorage.getItem('token'); await axios.post(`${API_BASE_URL}/newSaving`, { id: savingId || null, ...values }, { headers: { Authorization: `Bearer ${token}` } }); router.push('/savings'); };
    const remove = async () => { const token = localStorage.getItem('token'); await axios.post(`${API_BASE_URL}/deleteSaving`, { id: savingId }, { headers: { Authorization: `Bearer ${token}` } }); router.push('/savings'); };
    return <div className={styles.goalDetailLayout}><FormShell><form className={styles.goalForm} onSubmit={save}><FormInput label={t('Goal Name')} type="text" value={values.name} onChange={update('name')} /><FormInput label={t('Target Amount')} type="number" value={values.targetAmount} onChange={update('targetAmount')} /><FormSelect label={t('Currency')} values={currencies} valueLabel="name" multipleValueLabel={['name', 'symbol']} value={values.currencyId} onChange={update('currencyId')} defaultLabel={t('Select a Currency')} /><FormInput label={t('Starting Amount')} type="number" value={values.startingAmount} onChange={update('startingAmount')} /><div className={styles.commentField}><label>{t('Comment')}</label><textarea value={values.comment} onChange={update('comment')} placeholder={t('Optional note about this goal')} /></div><FormActionBar editing={Boolean(savingId)} onCancel={() => router.push('/savings')} onDelete={remove} createLabel={t('Create Goal')} updateLabel={t('Update Goal')} /></form></FormShell>{savingId && <aside className={styles.goalTransactions}><h3>{t('Goal activity')}</h3>{transactions.length ? transactions.map((transaction) => <div key={transaction.id}><span>{new Date(transaction.transaction_date).toLocaleDateString()}</span><p>{transaction.comment || t('Saved money')}</p><b>{transaction.currency_symbol} {transaction.amount}</b></div>) : <p>{t('No savings added to this goal yet.')}</p>}</aside>}</div>;
}
