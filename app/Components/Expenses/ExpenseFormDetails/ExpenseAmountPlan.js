import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import styles from './ExpenseAmountPlan.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';

const months = Array.from({ length: 12 }, (_, index) => index + 1);

export default function ExpenseAmountPlan({ expense, expenseAmounts, expenseSchedule, amountSchedule, onSaved }) {
    const { locale, t } = useTranslation();
    const [year, setYear] = useState(new Date().getFullYear());
    const [values, setValues] = useState(() => Object.fromEntries((amountSchedule || []).map((item) => [`${item.expense_amount_id}-${item.month}`, String(item.amount)])));
    const [isSaving, setIsSaving] = useState(false);
    const isScheduled = Number(expense.type_id) === 2;
    const activeMonths = isScheduled ? new Set((expenseSchedule || []).map((item) => Number(item.month))) : new Set(Array.from({ length: 12 }, (_, index) => index + 1));

    const updateValue = (expenseAmountId, month, value) => {
        setValues((previous) => ({ ...previous, [`${expenseAmountId}-${month}`]: value }));
    };

    useEffect(() => {
        if (year === new Date().getFullYear()) {
            return;
        }
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/getExpense?expenseId=${expense.id}&scheduleYear=${year}`, { headers: { Authorization: `Bearer ${token}` } }).then(({ data }) => {
            setValues(Object.fromEntries((data.expenseAmountSchedule || []).map((item) => [`${item.expense_amount_id}-${item.month}`, String(item.amount)])));
        });
    }, [expense.id, year]);

    const save = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const amountSchedule = [];
            activeMonths.forEach((month) => {
                expenseAmounts.forEach((amount) => {
                    const key = `${amount.id}-${month}`;
                    if (values[key] !== undefined && values[key] !== '') {
                        amountSchedule.push({ expenseAmountId: amount.id, year, month, amount: values[key] });
                    }
                });
            });
            await axios.post(`${API_BASE_URL}/createExpense`, {
                id: expense.id,
                name: expense.name,
                category: expense.category_id,
                expenseType: expense.type_id,
                expenseDueDate: expense.due_date,
                expenseDueDay: expense.due_date_day,
                expenseAmounts,
                scheduledMonths: (expenseSchedule || []).map((item) => ({ value: item.month })),
                amountSchedule,
            }, { headers: { Authorization: `Bearer ${token}` } });
            onSaved?.();
        } finally {
            setIsSaving(false);
        }
    };

    return <section className={styles.plan}>
        <header>
            <div><span><i className="bi bi-calendar2-week" aria-hidden="true" /></span><div><h2>{t('Payment Plan by Month')}</h2><p>{t('Set the amount due for each month and currency.')}</p></div></div>
            <div className={styles.controls}><button type="button" onClick={() => setYear((value) => value - 1)} aria-label={t('Previous year')}><i className="bi bi-chevron-left" aria-hidden="true" /></button><strong>{year}</strong><button type="button" onClick={() => setYear((value) => value + 1)} aria-label={t('Next year')}><i className="bi bi-chevron-right" aria-hidden="true" /></button></div>
        </header>
        <div className={styles.grid}>{months.map((month) => {
            if (!activeMonths.has(month)) return null;
            return <article key={month}><h3>{new Date(2026, month - 1, 1).toLocaleDateString(locale, { month: 'long' })}</h3>{expenseAmounts.map((amount) => {
                const key = `${amount.id}-${month}`;
                const schedule = (amountSchedule || []).find((item) => Number(item.expense_amount_id) === Number(amount.id) && Number(item.month) === month);
                const value = values[key] ?? (schedule ? String(schedule.amount) : String(amount.amount || 0));
                return <label key={amount.id}><span>{amount.currency_symbol}</span><input type="number" min="0" step="0.01" value={value} onFocus={(event) => event.target.select()} onChange={(event) => updateValue(amount.id, month, event.target.value)} onBlur={(event) => { if (event.target.value !== '' && Number.isFinite(Number(event.target.value))) updateValue(amount.id, month, Number(event.target.value).toFixed(2)); }} /></label>;
            })}</article>;
        })}</div>
        <footer><span>{t('Amounts without a custom value use the base expense amount.')}</span><button type="button" onClick={save} disabled={isSaving}>{isSaving ? t('Updating...') : t('Update Plan')}</button></footer>
    </section>;
}
