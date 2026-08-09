const passport = require('passport');
const passportCustom = require('passport-custom');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const { OAuth2Client } = require('google-auth-library');

const CustomStrategy = passportCustom.Strategy;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await User.getByEmail(email);

            if (!user) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }

            const isPasswordValid = await User.comparePasswords(password, user.password);

            if (!isPasswordValid) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    })
);

passport.use('google-login', new CustomStrategy(
    async function (req, callback) {
        const { token } = req.body;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (payload && payload.email_verified && payload.exp && new Date(payload.exp * 1000) >= new Date()) {
                return callback(null, payload);
            }
            return callback(true, null);
        } catch (error) {
            console.error('Google token verification failed:', error.message);
            return callback(error);
        }
    }
));
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.getById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});
