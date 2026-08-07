import React, { useEffect, useState } from 'react';
import styles from './Currencies.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import { useRouter } from 'next/router';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import FormInput from '@/Components/UI/Form/FormInput';
import FormSelect from '@/Components/UI/Form/FormSelect';
import { FormActionBar, FormShell } from '@/Components/UI/Form/FormLayout';

const CurrenciesForm = ({ currencyId }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [currencies, setCurrencies] = useState([]);
    const [currencyValue, setCurrencyValue] = useState('');
    const [customName, setCustomName] = useState('');
    const [customSymbol, setCustomSymbol] = useState('');

    const getCurrencySymbolById = (currencyId, currenciesList = currencies) => {
        const selectedCurrency = currenciesList.find((currency) => String(currency.id) === String(currencyId));
        return selectedCurrency ? selectedCurrency.symbol : '';
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const endpoint = currencyId ? `${API_BASE_URL}/getUserCurrency?currencyId=${currencyId}` : `${API_BASE_URL}/getUserCurrencies`;
        axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } }).then((response) => {
            const availableCurrencies = response.data.currencies || [];
            setCurrencies(availableCurrencies);
            if (response.data.userCurrency) {
                const selectedCurrencyId = response.data.userCurrency.currency_id || '';
                setCurrencyValue(selectedCurrencyId);
                setCustomName(response.data.userCurrency.custom_name || '');
                setCustomSymbol(response.data.userCurrency.custom_symbol || getCurrencySymbolById(selectedCurrencyId, availableCurrencies));
            }
        });
    }, [currencyId]);

    const handleCurrencyChange = (e) => {
        const selectedCurrencyId = e.target.value;
        setCurrencyValue(selectedCurrencyId);
        if (!customSymbol) {
            setCustomSymbol(getCurrencySymbolById(selectedCurrencyId));
        }
    };

    const save = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        await axios.post(`${API_BASE_URL}/saveUserCurrency`, {
            id: currencyId || null,
            currencyId: currencyValue || null,
            customName: customName || null,
            customSymbol: customSymbol || null
        }, { headers: { Authorization: `Bearer ${token}` } });
        router.push('/currencies');
    };

    const remove = async () => {
        const token = localStorage.getItem('token');
        await axios.post(`${API_BASE_URL}/deleteUserCurrency`, { id: currencyId }, { headers: { Authorization: `Bearer ${token}` } });
        router.push('/currencies');
    };

    return (
        <div>
            <ConfirmDialog />
            <FormShell className={styles.formShell}>
                <form className={styles.form} onSubmit={save}>
                <div className={styles.formWrapper}>
                    <FormSelect label={t('Currency')} values={currencies} valueLabel={'name'} multipleValueLabel={['name', 'symbol']} value={currencyValue} onChange={handleCurrencyChange} defaultLabel={t('Select a Currency')} />
                    <FormInput label={t('Custom Name')} type={'text'} value={customName} onChange={(e) => setCustomName(e.target.value)} />
                    <FormInput label={t('Symbol')} type={'text'} value={customSymbol} onChange={(e) => setCustomSymbol(e.target.value)} />
                </div>
                <FormActionBar editing={Boolean(currencyId)} onCancel={() => router.push('/currencies')} onDelete={() => confirmDialog({ message: t('Do you want to delete this?'), header: t('Delete Confirmation'), icon: 'pi pi-info-circle', acceptClassName: 'p-button-danger', accept: remove })} createLabel={`${t('Create')} ${t('Currency')}`} updateLabel={`${t('Update')} ${t('Currency')}`} />
                </form>
            </FormShell>
        </div>
    );
};

export default CurrenciesForm;
