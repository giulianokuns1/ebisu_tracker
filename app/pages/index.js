import React from 'react';
import Head from 'next/head';
import Home from '@/Components/Home/Home';
import Layout from '@/Components/Layout/Layout';
import { WEBSITE_NAME, SITE_URL } from '@/constants';

const HOME_DESCRIPTION =
    'Ebisu Tracker is a personal finance and expense tracker for spending, payments, budgets, savings goals, and cash flow.';

function HomePage() {
    const pageUrl = SITE_URL ? `${SITE_URL.replace(/\/$/, '')}` : '';
    const canonicalUrl = pageUrl || undefined;
    const ogImageUrl = pageUrl ? `${pageUrl}/img/ebisu.jpg` : undefined;
    const pageTitle = `${WEBSITE_NAME} | Personal Finance & Expense Tracker`;
    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            ['What is Ebisu Tracker?', 'Ebisu Tracker is a personal finance and expense tracker that helps you organize spending, payments, savings goals, budgets, and cash flow in one dashboard.'],
            ['How does expense tracking work?', 'Add expenses, categories, due dates, and payment details. Ebisu Tracker keeps your spending and upcoming payments visible so you can make informed decisions.'],
            ['Can I track recurring expenses and upcoming payments?', 'Yes. You can manage recurring expenses, track payment progress, and review pending expenses before their due dates.'],
            ['Can I manage multiple currencies?', 'Yes. Ebisu Tracker supports multiple currencies so you can organize expenses and payments in the currencies you use.'],
            ['Can I set savings goals?', 'Yes. Create savings goals, record progress, and keep your financial targets visible alongside your day-to-day spending.'],
            ['Is Ebisu Tracker free to use?', 'Ebisu Tracker offers a free plan so you can begin tracking expenses and managing your personal finances without a credit card.'],
        ].map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })),
    };
    const softwareApplicationJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: WEBSITE_NAME,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        description: HOME_DESCRIPTION,
        ...(pageUrl && { url: pageUrl }),
    };

    const websiteJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: WEBSITE_NAME,
        description: HOME_DESCRIPTION,
        ...(pageUrl && {
            url: pageUrl,
            inLanguage: 'en',
            potentialAction: {
                '@type': 'SearchAction',
                target: `${pageUrl}/expenses?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
            },
        }),
    };

    const registerActionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'RegisterAction',
        name: 'Get Started Free',
        ...(pageUrl && {
            target: { '@type': 'EntryPoint', 'urlTemplate': `${pageUrl}/register` },
        }),
    };

    const organizationJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: WEBSITE_NAME,
        ...(pageUrl && {
            url: pageUrl,
            logo: `${pageUrl}/img/logo.png`,
            image: `${pageUrl}/img/ebisu.jpg`,
            potentialAction: {
                '@type': 'ViewAction',
                target: pageUrl,
            },
        }),
    };

    const webPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageTitle,
        description: HOME_DESCRIPTION,
        ...(canonicalUrl && { url: canonicalUrl }),
        ...(pageUrl && { primaryImageOfPage: { '@type': 'ImageObject', url: `${pageUrl}/img/logo.png` } }),
    };

    return (
        <Layout showParticles={false}>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={HOME_DESCRIPTION} />
                <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
                <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={HOME_DESCRIPTION} />
                {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
                <meta property="og:site_name" content={WEBSITE_NAME} />
                {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
                {ogImageUrl && <meta property="og:image:secure_url" content={ogImageUrl} />}
                <meta property="og:image:alt" content="Ebisu Tracker dashboard preview" />
                <meta property="og:locale" content="en_US" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={HOME_DESCRIPTION} />
                {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}
                <meta name="twitter:image:alt" content="Ebisu Tracker dashboard preview" />
                <meta name="application-name" content={WEBSITE_NAME} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
                />
                {pageUrl && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(registerActionJsonLd) }}
                    />
                )}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
                />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            </Head>
            <Home />
        </Layout>
    );
}

export default HomePage;
