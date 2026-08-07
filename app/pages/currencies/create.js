import React from 'react';
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { withAuth } from '@/Hoc/withAuth';
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import styles from '@/Components/Currencies/Currencies.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import CurrenciesForm from '@/Components/Currencies/CurrenciesForm';

function CurrenciesCreatePage() {
    const { t } = useTranslation();
    return (
        <LayoutApp>
            <Head><title>{`Add Currency | ${WEBSITE_NAME}`}</title></Head>
            <AppPageHeader eyebrow="Preferences" title={t('Add Currency')} description="Add a currency you use to track your money." />
            <div className={styles.formContainer}><CurrenciesForm /></div>
        </LayoutApp>
    );
}

export default withAuth(CurrenciesCreatePage);
