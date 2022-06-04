const Users = require('../app/modules/user');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').split(' ')[1];

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await Users.findById(decoded.id);
        req.user = user;

        next();
    } catch (error) {
        res.clearCookie('refreshtoken', { path: '/api/refresh_token' });
        return res.status(500).json({ message: error.message });
    }
};

module.exports = auth;
