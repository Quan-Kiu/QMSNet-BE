const Users = require('../modules/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const AuthController = {
    register: async (req, res) => {
        try {
            const { fullname, email, password, username } = req.body;
            let newUsername = username.toLowerCase().replace(/ /g, '');
            const user_name = await Users.findOne({ username: newUsername });
            if (user_name)
                return res
                    .status(400)
                    .json({
                        message:
                            'Rất tiếc, tên tài khoản này đã tồn tại. Vui lòng sử dụng tên tài khoản khác.',
                    });
            if (username.length < 6)
                return res.status(400).json({
                    message: 'Tên tài khoản nhiều hơn 6 ký tự.',
                });
            if (username.length > 30)
                return res.status(400).json({
                    message: 'Tên tài khoản không quá 30 ký tự.',
                });
            if (fullname.length < 6)
                return res.status(400).json({
                    message: 'Họ tên nhiều hơn 6 ký tự.',
                });
            if (fullname.length > 30)
                return res.status(400).json({
                    message: 'Họ tên không quá 30 ký tự.',
                });

            const user_email = await Users.findOne({ email });
            if (user_email)
                return res.status(400).json({
                    message:
                        'Rất tiếc, email này đã tồn tại. Vui lòng sử dụng email khác.',
                });

            if (password.length < 6)
                return res.status(400).json({
                    message: 'Mật khẩu nhiều hơn 6 ký tự.',
                });
            const hashPassword = await bcrypt.hash(password, 12);

            const newUser = new Users({
                fullname,
                email,
                password: hashPassword,
                username: newUsername,
            });

            const accessToken = createAccessToken({ id: newUser._id });
            const refreshToken = refreshAccessToken({ id: newUser._id });

            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/api/refresh_token',
                maxAge: 30 * 7 * 24 * 60 * 60 * 1000,
            });

            await newUser.save();

            return res.status(201).json({
                message: 'Tạo tài khoản thành công, vui lòng đăng nhập.',
                accessToken,
                user: {
                    ...newUser._doc,
                    password: '',
                },
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await Users.findOne({ email }).populate(
                'followers following',
                '-password'
            );
            if (!user)
                return res.status(400).json({
                    message:
                        'Rất tiếc, email của bạn không đúng. Vui lòng kiểm tra lại email.',
                });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return res.status(400).json({
                    message:
                        'Rất tiếc, mật khẩu của bạn không đúng. Vui lòng kiểm tra lại mật khẩu.',
                });

            const accessToken = createAccessToken({ id: user._id });
            const refreshToken = refreshAccessToken({ id: user._id });

            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/api/refresh_token',
                maxAge: 30 * 7 * 24 * 60 * 60 * 1000,
            });

            return res.status(201).json({
                message: 'Đăng nhập thành công.',
                accessToken,
                user: {
                    ...user._doc,
                    password: '',
                },
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', { path: '/api/refresh_token' });
            return res.status(200).json({ message: 'Đăng xuất thành công' });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    generateAccessToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken;
            if (!rf_token) {
                return res
                    .status(400)
                    .json({ message: 'Vui lòng đăng nhập lại.' });
            }

            jwt.verify(
                rf_token,
                process.env.REFRESH_TOKEN_SECRET,
                async (err, result) => {
                    if (err)
                        return res
                            .status(400)
                            .json({ message: 'Vui lòng đăng nhập lại.' });
                    const user = await Users.findById(result.id)
                        .select('-password')
                        .populate('followers following', '-password')
                        .populate('saved', '');
                    if (!user)
                        return res
                            .status(400)
                            .json({ message: 'Tài khoản không tồn tại.' });
                    const accessToken = createAccessToken({ id: result.id });
                    res.status(200).json({ accessToken: accessToken, user });
                }
            );
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
};

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
    });
};
const refreshAccessToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '15d',
    });
};

module.exports = AuthController;
