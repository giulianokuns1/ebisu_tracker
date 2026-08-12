import React from "react";
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/Accounts/Accounts.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import AccountsForm from "@/Components/Accounts/AccountsForm";

function AccountCreatePage() {
    const { t } = useTranslation();

    return (
        <LayoutApp>
            <Head>
                <title>{`Add Account | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('New account')} title={t('Add Account')} description={t('Add an account to organize your finances.')} />
            <div className={styles.Form}>
                <AccountsForm />
            </div>
        </LayoutApp>
    );
}

export default withAuth(AccountCreatePage);
