import React from "react";
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/Expenses/Expenses.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import ExpenseFormDetails from "@/Components/Expenses/ExpenseFormDetails/ExpenseFormDetails";
import { useRouter } from "next/router";

function ExpensesDetailsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { expenseId } = router.query;
    return (
        <LayoutApp>
            <Head>
                <title>{`Edit Expense | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('Expense details')} title={t('Edit Expense')} description={t('Review and update this expense.')} />
            <div className={styles.formContainer}>
                {expenseId && <ExpenseFormDetails expenseId={expenseId} />}
            </div>
        </LayoutApp>
    );
}

export default withAuth(ExpensesDetailsPage);
