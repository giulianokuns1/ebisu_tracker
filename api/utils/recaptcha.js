const https = require('https');

const DEFAULT_MIN_SCORE = 0.5;
const recaptchaRequired = () => process.env.NODE_ENV === 'production';

const postForm = (url, data) => {
    const body = new URLSearchParams(data).toString();
    return new Promise((resolve, reject) => {
        const request = https.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(body)
            }
        }, (response) => {
            let raw = '';
            response.on('data', (chunk) => {
                raw += chunk;
            });
            response.on('end', () => {
                try {
                    resolve(JSON.parse(raw));
                } catch (error) {
                    reject(error);
                }
            });
        });

        request.on('error', reject);
        request.write(body);
        request.end();
    });
};

const normalizeHost = (urlString) => {
    try {
        return new URL(urlString).hostname;
    } catch (error) {
        return null;
    }
};

const verifyRecaptchaToken = async ({ token, expectedAction, remoteIp }) => {
    if (!recaptchaRequired()) {
        return { success: true, skipped: true };
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
        return { success: false, reason: 'missing_secret' };
    }
    if (!token || !expectedAction) {
        return { success: false, reason: 'missing_token_or_action' };
    }

    const verifyResponse = await postForm('https://www.google.com/recaptcha/api/siteverify', {
        secret,
        response: token,
        remoteip: remoteIp || ''
    });

    const minScore = Number(process.env.RECAPTCHA_MIN_SCORE || DEFAULT_MIN_SCORE);
    const originHost = normalizeHost(process.env.APP_ORIGIN || '');
    const hostnameMatches = !originHost || !verifyResponse.hostname || verifyResponse.hostname === originHost;

    if (!verifyResponse.success) {
        return { success: false, reason: 'verification_failed', details: verifyResponse };
    }
    if (verifyResponse.action !== expectedAction) {
        return { success: false, reason: 'invalid_action', details: verifyResponse };
    }
    if (typeof verifyResponse.score === 'number' && verifyResponse.score < minScore) {
        return { success: false, reason: 'low_score', details: verifyResponse };
    }
    if (!hostnameMatches) {
        return { success: false, reason: 'invalid_hostname', details: verifyResponse };
    }

    return { success: true, details: verifyResponse };
};

module.exports = {
    recaptchaRequired,
    verifyRecaptchaToken
};
