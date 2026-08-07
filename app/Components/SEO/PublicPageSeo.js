import Head from 'next/head';
import { SITE_URL, WEBSITE_NAME } from '@/constants';

const siteUrl = (SITE_URL || 'https://ebisutracker.com').replace(/\/$/, '');

export const publicUrl = (path = '/') => `${siteUrl}${path === '/' ? '' : path}`;

export default function PublicPageSeo({ title, description, path = '/', noIndex = false }) {
    const url = publicUrl(path);
    const image = publicUrl('/img/ebisu.jpg');
    const robots = noIndex ? 'noindex, follow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="robots" content={robots} />
            <meta name="googlebot" content={robots} />
            <link rel="canonical" href={url} />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content={WEBSITE_NAME} />
            <meta property="og:image" content={image} />
            <meta property="og:image:alt" content="Ebisu Tracker personal finance dashboard" />
            <meta property="og:locale" content="en_US" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Head>
    );
}
