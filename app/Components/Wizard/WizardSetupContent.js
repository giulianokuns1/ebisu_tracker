import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import styles from '@/Components/Wizard/WizardSetup.module.scss';
import Button from '@/Components/UI/Button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { useRouter } from 'next/router';

const STEPS = ['Currencies', 'Categories', 'Expenses', 'Payment Methods'];

const WizardSetupContent = () => {
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

    useEffect(() => {
        const load = async () => {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/wizard/config`, { headers: { Authorization: `Bearer ${token}` } });
            setCurrencies(response.data.currencies || []);
            setWizardCategories(response.data.wizardCategories || []);
            setWizardExpenses(response.data.wizardExpenses || []);
            setWizardPaymentMethods(response.data.wizardPaymentMethods || []);
            setExpenseTypes(response.data.expenseTypes || []);
        };
        load().catch(console.error);
        const storedCustomCurrencies = sessionStorage.getItem('wizard_custom_currencies');
        if (storedCustomCurrencies) setCustomCurrencies(JSON.parse(storedCustomCurrencies));
    }, []);

    useEffect(() => {
        sessionStorage.setItem('wizard_custom_currencies', JSON.stringify(customCurrencies));
    }, [customCurrencies]);

    const selectedCategoriesNames = useMemo(() => selectedCategories.map((c) => c.customName || c.name), [selectedCategories]);
    const orderedMainCurrencies = useMemo(() => {
        const usd = currencies.find((c) => c.name === 'Dolar');
        const eur = currencies.find((c) => c.name === 'Euro');
        const others = currencies.filter((c) => c.name !== 'Dolar' && c.name !== 'Euro');
        return { first: [usd, eur].filter(Boolean), others };
    }, [currencies]);

    const toggleCurrency = (currencyId) => {
        setSelectedCurrencyIds((prev) => {
            const exists = prev.includes(currencyId);
            const next = exists ? prev.filter((id) => id !== currencyId) : [...prev, currencyId];
            if (!next.includes(defaultCurrencyId)) setDefaultCurrencyId(next.length ? String(next[0]) : '');
            return next;
        });
    };

    const toggleCategory = (category) => setSelectedCategories((prev) => prev.find((c) => c.id === category.id) ? prev.filter((c) => c.id !== category.id) : [...prev, { ...category, customName: category.name }]);
    const updateCategoryName = (categoryId, name) => setSelectedCategories((prev) => prev.map((c) => c.id === categoryId ? { ...c, customName: name } : c));

    const toggleExpense = (expense) => {
        setSelectedExpenses((prev) => prev.find((e) => e.id === expense.id) ? prev.filter((e) => e.id !== expense.id) : [...prev, { ...expense, customName: expense.name, selectedCategoryName: selectedCategoriesNames[0] || expense.default_category_name, expenseTypeId: 1, expenseDueDate: new Date().toISOString(), expenseDueDay: 1, expenseAmounts: selectedCurrencyIds.filter((id) => !String(id).startsWith('custom_')).map((id) => ({ currency_id: id, amount: '' })) }]);
    };

    const updateExpenseField = (expenseId, field, value) => setSelectedExpenses((prev) => prev.map((e) => e.id === expenseId ? { ...e, [field]: value } : e));
    const updateExpenseAmount = (expenseId, currencyId, amount) => setSelectedExpenses((prev) => prev.map((e) => e.id === expenseId ? { ...e, expenseAmounts: e.expenseAmounts.map((ea) => ea.currency_id === currencyId ? { ...ea, amount } : ea) } : e));
    const togglePaymentMethod = (method) => setSelectedPaymentMethods((prev) => prev.find((m) => m.id === method.id) ? prev.filter((m) => m.id !== method.id) : [...prev, { ...method, customName: method.name }]);

    const addCustomCurrency = () => {
        if (!customCurrencyName || !customCurrencySymbol) return;
        const customId = `custom_${Date.now()}`;
        setCustomCurrencies((prev) => [...prev, { id: customId, name: customCurrencyName, symbol: customCurrencySymbol }]);
        setSelectedCurrencyIds((prev) => [...prev, customId]);
        setCustomCurrencyName('');
        setCustomCurrencySymbol('');
        setShowCurrencyModal(false);
    };

    const saveWizard = async () => {
        try {
            const token = localStorage.getItem('token');
            const dbCurrencyIds = selectedCurrencyIds.filter((id) => !String(id).startsWith('custom_'));
            const defaultDbCurrencyId = String(defaultCurrencyId).startsWith('custom_') ? (dbCurrencyIds[0] || null) : defaultCurrencyId;
            await axios.post(`${API_BASE_URL}/wizard/complete`, { selectedCurrencyIds: dbCurrencyIds, defaultCurrencyId: defaultDbCurrencyId || null, selectedCategories, selectedExpenses, selectedPaymentMethods, defaultPaymentMethodName }, { headers: { Authorization: `Bearer ${token}` } });
            toastRef.current.show({ severity: 'success', summary: t('Success'), detail: t('Starting setup completed successfully'), life: 3000 });
            sessionStorage.removeItem('wizard_custom_currencies');
            setTimeout(() => router.push('/dashboard'), 800);
        } catch {
            toastRef.current.show({ severity: 'error', summary: t('Error'), detail: t('Error completing wizard setup'), life: 3000 });
        }
    };

    return (
        <>
            <Toast ref={toastRef} position="top-center" />
            <div className={styles.wizardCard}>
                <div className={styles.stepHeader}>{t(STEPS[step])}</div>
                <div className={styles.stepSubtext}>{t('Step')} {step + 1} {t('of')} {STEPS.length}</div>
                {step === 0 && <div>{/* simplified render retained in page before refactor */}</div>}
            </div>
        </>
    );
};

export default WizardSetupContent;
