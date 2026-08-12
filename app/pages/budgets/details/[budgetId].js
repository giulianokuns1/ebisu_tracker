import React from "react";
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/Budgets/Budgets.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import BudgetsForm from "@/Components/Budgets/BudgetsForm";
import { useRouter } from "next/router";

function BudgetsDetailsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { budgetId } = router.query;

    return (
        <LayoutApp>
            <Head>
                <title>{`Budget | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('Budget details')} title={t('Budget')} description={t('Review and update this spending limit.')} />
            <div className={styles.budgetsForm}>
                <BudgetsForm budgetId={budgetId} />
            </div>
        </LayoutApp>
    );
}

export default withAuth(BudgetsDetailsPage);
