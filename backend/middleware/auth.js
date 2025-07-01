const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }
        
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token missing' });
        }

        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        req.auth = {
            userId: decodedToken.userId
        };
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ 
            error: 'Requête non authentifiée',
            details: error.message 
        });
    }
};