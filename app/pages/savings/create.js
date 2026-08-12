import React from "react";
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/Savings/Savings.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import SavingsForm from "@/Components/Savings/SavingsForm";

function SavingCreatePage() {
    const { t } = useTranslation();

    return (
        <LayoutApp>
            <Head>
                <title>{`Create Goal | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('New savings goal')} title={t('Create Goal')} description={t('Set a target and begin tracking progress.')} />
            <div className={styles.form}>
                <SavingsForm />
            </div>
        </LayoutApp>
    );
}

export default withAuth(SavingCreatePage);
