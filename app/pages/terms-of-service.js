import React from 'react';
import { WEBSITE_NAME } from '@/constants';
import Layout from '@/Components/Layout/Layout';
import TermsOfService from '@/Components/TermsOfService/TermsOfService';
import PublicPageSeo from '@/Components/SEO/PublicPageSeo';

function TermsOfServicePage() {
    return (
        <Layout showParticles={false} isLogin={true}>
            <PublicPageSeo title={`Terms of Service | ${WEBSITE_NAME}`} description={`${WEBSITE_NAME} terms of service including account responsibilities, acceptable use, disclaimers, and liability limits.`} path="/terms-of-service" />
            <TermsOfService />
        </Layout>
    );
}

export default TermsOfServicePage;
