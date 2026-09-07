import { useEffect, useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import ExpensePayment from '@/Components/Expenses/ExpensePayment';
import Loading from '@/Components/UI/Loading';
import { API_BASE_URL, WEBSITE_NAME } from '@/constants';
import { withAuth } from '@/Hoc/withAuth';
import { useRouter } from 'next/router';
import { useTranslation } from '@/Hooks/useTranslation';

function MobilePaymentPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { expenseId, from = '/dashboard' } = router.query;
    const [expense, setExpense] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!expenseId) return;
        const token = localStorage.getItem('token');
        Promise.all([
            axios.get(`${API_BASE_URL}/getExpense?expenseId=${expenseId}`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API_BASE_URL}/getPaymentMethods`, { headers: { Authorization: `Bearer ${token}` } }),
        ]).then(([expenseResponse, paymentMethodsResponse]) => {
            const data = expenseResponse.data;
            if (!data.expense) return;
            setExpense({ ...data.expense, expense_amounts: data.expenseAmounts || [], paymentMethods: paymentMethodsResponse.data.paymentMethods || [] });
        }).finally(() => setLoading(false));
    }, [expenseId]);

    if (loading) return <LayoutApp><Loading /></LayoutApp>;
    if (!expense) return <LayoutApp><AppPageHeader eyebrow={t('Payment')} title={t('Payment unavailable')} description={t('This expense could not be loaded.')} /><button type="button" onClick={() => router.replace(String(from))}>{t('Back')}</button></LayoutApp>;

    return <LayoutApp>
        <Head><title>{`Record Payment | ${WEBSITE_NAME}`}</title></Head>
        <AppPageHeader eyebrow={t('Record payment')} title={expense.name} description={t('Review and confirm the payment.')} />
        <ExpensePayment expense={expense} fullPage returnTo={String(from)} onAddExpensePayment={() => {}} />
    </LayoutApp>;
}

export default withAuth(MobilePaymentPage);
