import React from "react";
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/PaymentMethods/PaymentMethods.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import PaymentMethodsForm from "@/Components/PaymentMethods/PaymentMethodsForm";
import { useRouter } from "next/router";

function PaymentMethodsDetailsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { paymentMethodId } = router.query;

    return (
        <LayoutApp>
            <Head>
                <title>{`Edit Payment Method | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow="Payment setup" title={t('Edit Payment Method')} description="Review and update this payment method." />
            <div className={styles.paymentMethodForm}>
                <PaymentMethodsForm paymentMethodId={paymentMethodId} />
            </div>
        </LayoutApp>
    );
}

export default withAuth(PaymentMethodsDetailsPage);
