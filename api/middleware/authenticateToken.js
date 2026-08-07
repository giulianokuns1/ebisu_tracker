const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    let token = req.headers.authorization || (req.cookies && req.cookies.auth_token);

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (typeof token === 'string' && token.startsWith("Bearer ")) {
        token = token.substring(7);
    }
    jwt.verify(token, process.env.SESSION_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
