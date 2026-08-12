import React from "react";
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/Payments/Payments.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import PaymentsForm from "@/Components/Payments/PaymentsForm";
import { useRouter } from "next/router";

function PaymentsDetailsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { paymentId } = router.query;

    return (
        <LayoutApp>
            <Head>
                <title>{`Edit Payment | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('Payment details')} title={t('Edit Payment')} description={t('Review and update this payment.')} />
            <div className={styles.expensesForm}>
                <PaymentsForm paymentId={paymentId} />
            </div>
        </LayoutApp>
    );
}

export default withAuth(PaymentsDetailsPage);
