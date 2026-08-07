import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { withAuth } from '@/Hoc/withAuth';
import { API_BASE_URL, WEBSITE_NAME } from '@/constants';
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import Loading from '@/Components/UI/Loading';
import SavingsDashboard from '@/Components/Savings/SavingsDashboard';
import { useTranslation } from '@/Hooks/useTranslation';
import DateRangeFilter from '@/Components/UI/DateRangeFilter';

const formatLocalDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

function SavingsPage() {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [range, setRange] = useState([new Date(new Date().getFullYear(), 0, 1), new Date()]);
    const load = useCallback(async () => {
        const token = localStorage.getItem('token');
        const [startDate, endDate] = range;
        if (!startDate || !endDate) return;
        const params = new URLSearchParams({ startDate: formatLocalDate(startDate), endDate: formatLocalDate(endDate) });
        const response = await axios.get(`${API_BASE_URL}/getSavings?${params}`, { headers: { Authorization: `Bearer ${token}` } });
        setData(response.data);
    }, [range]);
    useEffect(() => { load().catch(() => setData({ goals: [], totals: {}, transactions: [] })); }, [load]);
    const clearRange = () => setRange([new Date(new Date().getFullYear(), 0, 1), new Date()]);
    return <LayoutApp><Head><title>{`Savings | ${WEBSITE_NAME}`}</title></Head><AppPageHeader eyebrow="Goal planning" title={t('Savings')} description={t('Track your savings and achieve your financial goals.')} actionHref="/savings/create" actionLabel={t('Add Goal')} secondaryAction={<DateRangeFilter value={range} onChange={setRange} onClear={clearRange} />} />{data ? <SavingsDashboard data={data} onRefresh={load} range={range} /> : <Loading />}</LayoutApp>;
}
export default withAuth(SavingsPage);
