import React, { useState } from 'react';
import styles from "@/Components/Expenses/ExpenseFormDetails/ExpenseDetails.module.scss";
import { useTranslation } from '@/Hooks/useTranslation';
import PointChart from "@/Components/UI/Chart/PointChart/PointChart";

const ExpenseDetails = ({ expenseData }) => {
    const { t } = useTranslation();
    let labels = [];
    let data = [];
    if (expenseData.paymentsByMonth) {
        const sortedByMonth = [...expenseData.paymentsByMonth].sort(
            (a, b) => (a.month || '').localeCompare(b.month || '')
        );
        labels = sortedByMonth.map((item) => item.yearMonth);
        data = sortedByMonth.map((item) => item.total);
    }
    return (
        <div className={styles.expenseDetailsContainer}>
            <PointChart
                labels={labels}
                data={data}
                mainLabel='Last 12 Months'
                subLabel='Total'
            />
        </div>
    );
};

export default ExpenseDetails;
