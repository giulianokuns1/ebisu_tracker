import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import LayoutApp from '@/Components/Layout/LayoutApp';
import MyAccount from "@/Components/MyAccount/MyAccount";
import AppPageHeader from '@/Components/Layout/AppPageHeader';

function MyAccountPage() {
    const { t } = useTranslation();
    return (
        <LayoutApp>
            <Head>
                <title>{`My Account | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow="Profile" title={t('My Account')} description={t('Manage your profile details.')} />
            <MyAccount />
        </LayoutApp>
    );
}

export default withAuth(MyAccountPage);
