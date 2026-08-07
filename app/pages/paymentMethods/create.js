import React from "react";
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/PaymentMethods/PaymentMethods.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import PaymentMethodsForm from "@/Components/PaymentMethods/PaymentMethodsForm";

function PaymentMethodsCreatePage() {
    const { t } = useTranslation();

    return (
        <LayoutApp>
            <Head>
                <title>{`Create Payment Method | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow="Payment setup" title={t('Create Payment Method')} description="Save a payment method for future expenses." />
            <div className={styles.paymentMethodForm}>
                <PaymentMethodsForm />
            </div>
        </LayoutApp>
    );
}

export default withAuth(PaymentMethodsCreatePage);
