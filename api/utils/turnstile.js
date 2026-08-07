const https = require('https');

const turnstileRequired = () => process.env.NODE_ENV === 'production';

const verifyTurnstileToken = ({ token, remoteIp }) => {
    if (!turnstileRequired()) return Promise.resolve({ success: true, skipped: true });

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return Promise.resolve({ success: false, reason: 'missing_secret' });
    if (!token) return Promise.resolve({ success: false, reason: 'missing_token' });

    const body = new URLSearchParams({ secret, response: token, remoteip: remoteIp || '' }).toString();
    return new Promise((resolve, reject) => {
        const request = https.request('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
        }, (response) => {
            let raw = '';
            response.on('data', (chunk) => { raw += chunk; });
            response.on('end', () => {
                try {
                    const result = JSON.parse(raw);
                    const originHost = new URL(process.env.APP_ORIGIN || 'http://localhost').hostname;
                    const hostnameMatches = !result.hostname || result.hostname === originHost;
                    resolve(result.success && hostnameMatches ? { success: true, details: result } : { success: false, reason: hostnameMatches ? 'verification_failed' : 'invalid_hostname', details: result });
                } catch (error) { reject(error); }
            });
        });
        request.on('error', reject);
        request.write(body);
        request.end();
    });
};

module.exports = { turnstileRequired, verifyTurnstileToken };
