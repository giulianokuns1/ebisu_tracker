import React from "react";
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/Savings/Savings.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import SavingsForm from "@/Components/Savings/SavingsForm";
import { useRouter } from "next/router";

function SavingDetailsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { savingId } = router.query;

    return (
        <LayoutApp>
            <Head>
                <title>{`Edit Goal | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('Goal details')} title={t('Edit Goal')} description={t('Review your target and recorded contributions.')} />
            <div className={styles.form}>
                <SavingsForm savingId={savingId} />
            </div>
        </LayoutApp>
    );
}

export default withAuth(SavingDetailsPage);
