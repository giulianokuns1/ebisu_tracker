require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql');
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

// const options = {
//     host: process.env.DB_SESSION_HOST,
//     port: 3306,
//     user: process.env.DB_SESSION_USER,
//     password: process.env.DB_SESSION_PASSWORD,
//     database: process.env.DB_SESSION_DATABASE
// };
// const sessionStore = new MySQLStore(options, mysql.createConnection(options));

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

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Money Tracker API' });
});

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
