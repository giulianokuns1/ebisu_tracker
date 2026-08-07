import React from "react";
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/Accounts/Accounts.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import AccountsForm from "@/Components/Accounts/AccountsForm";
import { useRouter } from "next/router";

function AccountsDetailsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { accountId } = router.query;

    return (
        <LayoutApp>
            <Head>
                <title>{`Account | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow="Account details" title={t('Account')} description="Review and update this financial account." />
            <div className={styles.accountsForm}>
                <AccountsForm accountId={accountId} />
            </div>
        </LayoutApp>
    );
}

export default withAuth(AccountsDetailsPage);
