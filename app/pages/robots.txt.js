import { SITE_URL } from '@/constants';

const buildRobotsTxt = () => {
    const siteUrl = (SITE_URL || '').replace(/\/$/, '');
    const lines = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        'Disallow: /dashboard',
        'Disallow: /expenses',
        'Disallow: /payments',
        'Disallow: /accounts',
        'Disallow: /activity',
        'Disallow: /budgets',
        'Disallow: /bills',
        'Disallow: /categories',
        'Disallow: /myaccount',
        'Disallow: /pendingExpenses',
        'Disallow: /paymentMethods',
        'Disallow: /savings',
        'Disallow: /settings',
        'Disallow: /wizard-setup',
    ];

    lines.push(`Sitemap: ${siteUrl}/sitemap.xml`);

    return `${lines.join('\n')}\n`;
};

export async function getServerSideProps({ res }) {
    res.setHeader('Content-Type', 'text/plain');
    res.write(buildRobotsTxt());
    res.end();

    return { props: {} };
}

export default function RobotsTxt() {
    return null;
}
