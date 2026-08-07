import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';

export default function Custom404() {
    return (
        <>
            <Head>
                <title>{`Page Not Found | ${WEBSITE_NAME}`}</title>
            </Head>
            <h2>404 - Page Not Found</h2>
        </>
    );
}
