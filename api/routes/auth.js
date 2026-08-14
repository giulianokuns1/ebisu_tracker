const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const PasswordResetCode = require('../models/passwordResetCode');
const { sendPasswordResetCode } = require('../utils/mailer');
const { turnstileRequired, verifyTurnstileToken } = require('../utils/turnstile');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 30,
};

const handleValidation = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ message: 'Invalid request data', errors: errors.array() });
        return false;
    }
    return true;
};

const credentialLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many authentication attempts. Please try again later.' },
});

const passwordResetRequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many password reset requests. Please try again later.' },
});

const passwordResetConfirmLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many password reset attempts. Please try again later.' },
});

const passwordResetMessage = 'If an account with that email can use password reset, a code has been sent.';

router.post('/register', credentialLimiter, [
    body('firstname').trim().notEmpty(),
    body('lastname').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('turnstileToken').if(turnstileRequired).isString().notEmpty(),
], async (req, res) => {
    if (!handleValidation(req, res)) {
        return;
    }
    let user;
    const { firstname, lastname, email, password } = req.body;

    try {
        const captchaCheck = await verifyTurnstileToken({
            token: req.body.turnstileToken,
            remoteIp: req.ip
        });
        if (!captchaCheck.success) {
            return res.status(403).json({ message: 'Captcha verification failed' });
        }

        const userExists = await User.getByEmail(email);

        if (userExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const userId = await User.createUser(firstname, lastname, email, password, null);
        const expirationDate = new Date();
        const token = jwt.sign({ id: userId }, process.env.SESSION_SECRET, {
            expiresIn: '720h',
        });
        // TODO Update the token on database
        expirationDate.setMonth(expirationDate.getMonth() + 1);
        user = await User.getById(userId);
        res.cookie('auth_token', token, authCookieOptions);
        res.status(200).json({
            message: 'Login successful',
            token,
            userData: {
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                created_at: user.created_at,
                default_currency_id: user.default_currency_id,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during registration.' });
    }
});
router.post('/login', credentialLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('turnstileToken').if(turnstileRequired).isString().notEmpty(),
], (req, res, next) => {
    if (!handleValidation(req, res)) {
        return;
    }
    verifyTurnstileToken({
        token: req.body.turnstileToken,
        remoteIp: req.ip
    }).then((captchaCheck) => {
        if (!captchaCheck.success) {
            return res.status(403).json({ message: 'Captcha verification failed' });
        }
        return passport.authenticate('local', { session: false }, async (err, user) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            try {
                const expirationDate = new Date();
                const token = jwt.sign({ id: user.id }, process.env.SESSION_SECRET, {
                    expiresIn: '720h',
                });

                expirationDate.setMonth(expirationDate.getMonth() + 1);
                // TODO Update the token on database
                res.cookie('auth_token', token, authCookieOptions);
                res.status(200).json({
                    message: 'Login successful',
                    token,
                    userData: {
                        id: user.id,
                        email: user.email,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        created_at: user.created_at,
                        default_currency_id: user.default_currency_id,
                    }
                });
            } catch (error) {
                res.status(500).json({ message: 'An error occurred during login.' });
            }
        })(req, res, next);
    }).catch((error) => {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred during login.' });
    });
});

router.post('/password-reset/request', passwordResetRequestLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('turnstileToken').if(turnstileRequired).isString().notEmpty(),
], async (req, res) => {
    if (!handleValidation(req, res)) {
        return;
    }

    try {
        const captchaCheck = await verifyTurnstileToken({ token: req.body.turnstileToken, remoteIp: req.ip });
        if (!captchaCheck.success) {
            return res.status(403).json({ message: 'Captcha verification failed' });
        }

        const user = await User.getByEmail(req.body.email);
        if (user && user.password) {
            const code = crypto.randomInt(100000, 1000000).toString();
            const codeHash = await bcrypt.hash(code, 10);
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await PasswordResetCode.replaceForUser(user.id, codeHash, expiresAt);
            await sendPasswordResetCode({ email: user.email, code });
        }

        return res.status(200).json({ message: passwordResetMessage });
    } catch (error) {
        console.error('Password reset request failed:', error.message || error);
        return res.status(500).json({ message: 'Unable to send a password reset code. Please try again later.' });
    }
});

router.post('/password-reset/confirm', passwordResetConfirmLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }).isNumeric(),
    body('password').isLength({ min: 8 }),
    body('turnstileToken').if(turnstileRequired).isString().notEmpty(),
], async (req, res) => {
    if (!handleValidation(req, res)) {
        return;
    }

    try {
        const captchaCheck = await verifyTurnstileToken({ token: req.body.turnstileToken, remoteIp: req.ip });
        if (!captchaCheck.success) {
            return res.status(403).json({ message: 'Captcha verification failed' });
        }

        const user = await User.getByEmail(req.body.email);
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Invalid or expired password reset code.' });
        }

        const resetCode = await PasswordResetCode.getActiveForUser(user.id);
        if (!resetCode || resetCode.attempts >= 5 || !(await bcrypt.compare(req.body.code, resetCode.code_hash))) {
            if (resetCode && resetCode.attempts < 5) {
                await PasswordResetCode.incrementAttempts(resetCode.id);
            }
            return res.status(400).json({ message: 'Invalid or expired password reset code.' });
        }

        await User.updatePassword(user.id, req.body.password);
        await PasswordResetCode.consume(resetCode.id);
        res.clearCookie('auth_token', authCookieOptions);
        return res.status(200).json({ message: 'Your password has been reset. Please log in.' });
    } catch (error) {
        console.error('Password reset confirmation failed:', error.message || error);
        return res.status(500).json({ message: 'Unable to reset your password. Please try again later.' });
    }
});
// router.get('/logout', (req, res) => {
//     req.logout();
//     res.json({ message: 'Logout successful' });
// });
router.get('/check-auth', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ isAuthenticated: false, user: null });
        }
        res.json({ isAuthenticated: true, user: req.user });
    } catch (error) {
        return res.status(401).json({ isAuthenticated: false, user: null });
    }
});
router.post('/google', credentialLimiter, [
    body('token').isString().notEmpty(),
], (req, res, next) => {
    if (!handleValidation(req, res)) {
        return;
    }
    passport.authenticate('google-login', { session: false }, async (err, googlePayload) => {
        let user;
        let today = new Date();
        let credentials = req.body.token;
        if (err) {
            console.error('Google authentication failed:', err.message || err);
            return res.status(500).json({ message: 'An error occurred during login.' });
        }
        try {
            if (googlePayload && googlePayload.email_verified && googlePayload.iss) {
                user = await User.getByEmail(googlePayload.email, true);
                if (!user) {
                    const userId = await User.createUser(
                        googlePayload.given_name,
                        googlePayload.family_name,
                        googlePayload.email,
                        googlePayload.email + today.getTime(),
                        credentials);
                    user = await User.getById(userId);
                } else {
                    await User.updateGoogleToken(user.id, credentials);
                }
                const expirationDate = new Date();
                const token = jwt.sign({ id: user.id }, process.env.SESSION_SECRET, {
                    expiresIn: '720h',
                });
                expirationDate.setMonth(expirationDate.getMonth() + 1);
                await User.updateToken(user.id, token, expirationDate.toISOString().slice(0, 19).replace('T', ' '));
                user = await User.getById(user.id);
                res.cookie('auth_token', token, authCookieOptions);

                return res.status(200).json({
                    message: 'Login successful',
                    token,
                    userData: {
                        id: user.id,
                        email: user.email,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        created_at: user.created_at,
                        default_currency_id: user.default_currency_id,
                        googleToken: googlePayload
                    }
                });
            } else {
                res.status(500).json({ message: 'An error occurred during login.' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred during login.' });
        }
    })(req, res, next);
});

router.post('/logout', (req, res) => {
    res.clearCookie('auth_token', authCookieOptions);
    return res.status(200).json({ message: 'Logout successful' });
});
module.exports = router;
