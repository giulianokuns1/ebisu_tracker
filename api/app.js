require('dotenv').config();
if (!process.env.SESSION_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('SESSION_SECRET must be set in production.');
    }
    process.env.SESSION_SECRET = 'ebisu-local-development-session-secret';
}
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const app = express();
const port = 8800;
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const knex = require('knex');
const knexConfig = require('./knexfile');
const db = knex(knexConfig.development);
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const passportConfig = require('./passport-config');
const rateLimit = require('express-rate-limit');

const sessionStore = new MySQLStore({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'money_tracker_db',
    createDatabaseTable: true,
});

var corsOptions = {
    origin: process.env.APP_ORIGIN || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to add the Knex instance to the request object
app.use((req, res, next) => {
    req.db = db;
    next();
});

// app.use(
//     session({
//         secret: process.env.SESSION_SECRET,
//         store: sessionStore,
//         resave: false,
//         saveUninitialized: false,
//     })
// );
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

app.use(passport.initialize());
app.use(passport.session());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1_000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests. Please try again later.' },
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Money Tracker API' });
});

app.use('/auth', authRoutes);
app.use('/api', apiLimiter, apiRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
