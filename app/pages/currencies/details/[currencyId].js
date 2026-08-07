import React from 'react';
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { withAuth } from '@/Hoc/withAuth';
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import styles from '@/Components/Currencies/Currencies.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import CurrenciesForm from '@/Components/Currencies/CurrenciesForm';
import { useRouter } from 'next/router';

function CurrencyDetailsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { currencyId } = router.query;
    return (
        <LayoutApp>
            <Head><title>{`Currency | ${WEBSITE_NAME}`}</title></Head>
            <AppPageHeader eyebrow="Currency details" title={t('Currency')} description="Review and update this currency." />
            <div className={styles.formContainer}><CurrenciesForm currencyId={currencyId} /></div>
        </LayoutApp>
    );
}

export default withAuth(CurrencyDetailsPage);
