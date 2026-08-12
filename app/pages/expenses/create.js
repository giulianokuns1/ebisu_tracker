import React from "react";
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/Expenses/Expenses.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import ExpenseFormDetails from "@/Components/Expenses/ExpenseFormDetails/ExpenseFormDetails";
import AppPageHeader from '@/Components/Layout/AppPageHeader';

function ExpensesCreatePage() {
    const { t } = useTranslation();

    return (
        <LayoutApp>
            <Head>
                <title>{`Create Expense | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('New expense')} title={t('Create Expense')} description={t('Add an expense and its payment schedule.')} />
            <div className={styles.expensesForm}>
                <ExpenseFormDetails />
            </div>
        </LayoutApp>
    );
}

export default withAuth(ExpensesCreatePage);
