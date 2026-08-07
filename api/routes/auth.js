const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const { turnstileRequired, verifyTurnstileToken } = require('../utils/turnstile');
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

router.post('/register', [
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
router.post('/login', [
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
router.post('/google', [
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
