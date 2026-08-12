import React from "react";
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/Payments/Payments.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import PaymentsForm from "@/Components/Payments/PaymentsForm";
import { useRouter } from "next/router";
import AppPageHeader from '@/Components/Layout/AppPageHeader';

function PaymentsCreatePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const expenseId = router.query.expenseId || null;

    return (
        <LayoutApp>
            <Head>
                <title>{`Create Payment | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('New payment')} title={t('Create Payment')} description={t('Record a payment against an expense.')} />
            <div className={styles.paymentForm}>
                <PaymentsForm defaultExpenseId={expenseId} />
            </div>
        </LayoutApp>
    );
}

export default withAuth(PaymentsCreatePage);
