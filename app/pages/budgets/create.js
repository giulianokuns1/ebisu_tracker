import React from "react";
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/Budgets/Budgets.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import BudgetsForm from "@/Components/Budgets/BudgetsForm";

function BudgetCreatePage() {
    const { t } = useTranslation();

    return (
        <LayoutApp>
            <Head>
                <title>{`Add Budget | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('New budget')} title={t('Add Budget')} description={t('Set a spending limit for a category.')} />
            <div className={styles.budgetForm}>
                <BudgetsForm />
            </div>
        </LayoutApp>
    );
}

export default withAuth(BudgetCreatePage);
