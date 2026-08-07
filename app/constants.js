import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const BASE_API_URL = publicRuntimeConfig.BASE_API_URL;
const BASE_AUTH_URL = publicRuntimeConfig.BASE_AUTH_URL;
export const API_BASE_URL = BASE_API_URL + '/api';
export const API_AUTH_URL = BASE_AUTH_URL + '/auth';
export const GOOGLE_CLIENT_ID = publicRuntimeConfig.GOOGLE_CLIENT_ID || '';

export const WEBSITE_NAME = 'Ebisu Tracker';
export const SITE_URL = publicRuntimeConfig.SITE_URL || 'https://ebisutracker.com';
