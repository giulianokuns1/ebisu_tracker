const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    publicRuntimeConfig: {
        BASE_API_URL: process.env.BASE_API_URL || (isDevelopment ? 'http://localhost:8800' : ''),
        BASE_AUTH_URL: process.env.BASE_AUTH_URL || (isDevelopment ? 'http://localhost:8800' : ''),
        SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://ebisutracker.com',
        GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
        RECAPTCHA_ENABLED: process.env.NODE_ENV === 'production',
    },
};
