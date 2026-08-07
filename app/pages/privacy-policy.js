import React from 'react';
import { WEBSITE_NAME } from '@/constants';
import Layout from '@/Components/Layout/Layout';
import PrivacyPolicy from '@/Components/PrivacyPolicy/PrivacyPolicy';
import PublicPageSeo from '@/Components/SEO/PublicPageSeo';

function PrivacyPolicyPage() {
    return (
        <Layout showParticles={false} isLogin={true}>
            <PublicPageSeo title={`Privacy Policy | ${WEBSITE_NAME}`} description={`${WEBSITE_NAME} privacy policy describing account data handling, security, cookies, and user rights.`} path="/privacy-policy" />
            <PrivacyPolicy />
        </Layout>
    );
}

export default PrivacyPolicyPage;
