import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Custom404() {
    const { t } = useTranslation();
    return (
        <>
            <Head>
                <title>{`Page Not Found | ${WEBSITE_NAME}`}</title>
            </Head>
            <h2>{t('404 - Page Not Found')}</h2>
        </>
    );
}
