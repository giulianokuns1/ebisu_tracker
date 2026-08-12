import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import LayoutApp from "@/Components/Layout/LayoutApp";
import { withAuth } from "@/Hoc/withAuth";
import Dashboard from "@/Components/Dashboard/Dashboard";
import styles from '@/Components/Dashboard/Dashboard.module.scss';
import Loading from "@/Components/UI/Loading";
import axios from "axios";
import { API_BASE_URL } from "@/constants";

const SHOW_LOADING_TEST = false;

function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [monthOffset, setMonthOffset] = useState(0);
    const [monthEdits, setMonthEdits] = useState({});
    const { t } = useTranslation();
    const getData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/dashboard/get?monthOffset=${monthOffset}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setData(response.data);
        } catch (requestError) {
            console.error('Error fetching dashboard data:', requestError);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [monthOffset]);
    useEffect(() => {
        if (SHOW_LOADING_TEST) {
            return;
        }
        getData();
    }, [getData]);
    const onAddExpensePayment = () => {
        getData();
    }
    const onPeriodChange = (offset) => {
        setMonthEdits({});
        setMonthOffset(offset);
    };
    const saveMonthEdits = async () => {
        const target = new Date();
        target.setDate(1);
        target.setMonth(target.getMonth() - monthOffset);
        const token = localStorage.getItem('token');
        await Promise.all(Object.values(monthEdits).map((edit) => axios.post(`${API_BASE_URL}/updateExpenseMonthAmounts`, {
            expenseId: edit.expenseId,
            year: target.getFullYear(),
            month: target.getMonth() + 1,
            amounts: Object.values(edit.amounts),
        }, { headers: { Authorization: `Bearer ${token}` } })));
        setMonthEdits({});
        getData();
    };
    return (
        <LayoutApp>
            <Head>
                <title>{`Dashboard | ${WEBSITE_NAME}`}</title>
            </Head>
            {SHOW_LOADING_TEST || loading ? <Loading /> : error ? <div className={styles.loadError}><h1>{t('Dashboard unavailable')}</h1><p>{t('We could not load your dashboard right now.')}</p><button type="button" onClick={getData}>{t('Try again')}</button></div> : data && <Dashboard data={data} onAddExpensePayment={onAddExpensePayment} monthOffset={monthOffset} onPeriodChange={onPeriodChange} monthEdits={monthEdits} setMonthEdits={setMonthEdits} onSaveMonthEdits={saveMonthEdits} />}
        </LayoutApp>
    );
}

export default withAuth(DashboardPage);
