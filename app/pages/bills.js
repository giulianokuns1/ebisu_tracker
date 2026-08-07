import React, { useState } from 'react';
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import LayoutApp from "@/Components/Layout/LayoutApp";
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import {withAuth} from "@/Hoc/withAuth";

function BillsPage() {
    const [response, setResponse] = useState(null);
    const { t } = useTranslation();

    return (
        <LayoutApp>
            <Head>
                <title>{`Bills | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow="Upcoming commitments" title={t('Bills')} description="Review your recurring bills and due dates." />
        </LayoutApp>
    );
}

export default withAuth(BillsPage);
