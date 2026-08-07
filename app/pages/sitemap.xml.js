import { SITE_URL } from '@/constants';

const INDEXABLE_ROUTES = [
    '/',
    '/privacy-policy',
    '/terms-of-service',
];

const buildSitemapXml = () => {
    const siteUrl = (SITE_URL || '').replace(/\/$/, '');
    const lastModified = '2026-08-07T00:00:00.000Z';

    const urls = INDEXABLE_ROUTES.map((route) => {
        const loc = route === '/' ? siteUrl : `${siteUrl}${route}`;
        const priority = route === '/' ? '1.0' : '0.5';
        const changefreq = route === '/' ? 'weekly' : 'monthly';
        return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastModified}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
};

export async function getServerSideProps({ res }) {
    res.setHeader('Content-Type', 'text/xml');
    res.write(buildSitemapXml());
    res.end();

    return { props: {} };
}

export default function SitemapXml() {
    return null;
}
