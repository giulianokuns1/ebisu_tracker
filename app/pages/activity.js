import React, { useState } from 'react';
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import LayoutApp from "@/Components/Layout/LayoutApp";
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import {withAuth} from "@/Hoc/withAuth";

function ActivityPage() {
    const [response, setResponse] = useState(null);
    const { t } = useTranslation();

    return (
        <LayoutApp>
            <Head>
                <title>{`Activity | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow={t('Timeline')} title={t('Activity')} description={t('Review recent changes to your finances.')} />
        </LayoutApp>
    );
}

export default withAuth(ActivityPage);
