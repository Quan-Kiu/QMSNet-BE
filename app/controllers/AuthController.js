const Users = require('../modules/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createRes = require('../../utils/response_utils');

const AuthController = {
    register: async (req, res, next) => {
        console.log(req.body)
        try {
            const { fullname, email, password, username } = req.body;
            let newUsername = username.toLowerCase().replace(/ /g, '');
            const user_name = await Users.findOne({ username: newUsername });
            if (user_name)
                return next(createRes.error('Rất tiếc, tên tài khoản này đã tồn tại. Vui lòng sử dụng tên tài khoản khác.'));
            if (username.length < 6)
                return next(createRes.error(
                    'Tên tài khoản nhiều hơn 6 ký tự.',
                ));
            if (username.length > 30)
                return next(createRes.error(
                    'Tên tài khoản không quá 30 ký tự.'
                ));

            if (fullname.length < 6)
                return next(createRes.error(
                    'Họ tên nhiều hơn 6 ký tự.',
                ));

            if (fullname.length > 30)
                return next(createRes.error(
                    'Họ tên không quá 30 ký tự.',
                ));


            const user_email = await Users.findOne({ email });
            if (user_email)
                return next(createRes.error(
                    'Rất tiếc, email này đã tồn tại. Vui lòng sử dụng email khác.',
                ));

            if (password.length < 6)
                return next(createRes.error(
                    'Mật khẩu nhiều hơn 6 ký tự.',
                ));

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

            return res.status(201).json(createRes.success('Tạo tài khoản thành công, vui lòng đăng nhập.', {
                accessToken,
                user: {
                    ...newUser._doc,
                    password: '',
                },
            }));
        } catch (err) {
            return next(err);
        }
    },

    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await Users.findOne({ email })
            if (!user)
                return next(createRes.error(
                    'Rất tiếc, email của bạn không đúng. Vui lòng kiểm tra lại email.',
                ));



            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return next(createRes.error(
                    'Rất tiếc, mật khẩu của bạn không đúng. Vui lòng kiểm tra lại mật khẩu.',

                ));

            const accessToken = createAccessToken({ id: user._id });
            const refreshToken = refreshAccessToken({ id: user._id });

            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/api/refresh_token',
                maxAge: 30 * 7 * 24 * 60 * 60 * 1000,
            });

            return res.status(201).json(createRes.success('Đăng nhập thành công.', {
                accessToken,
                user: {
                    ...user._doc,
                    password: '',
                },
            }));
        } catch (err) {
            next(err);
        }
    },

    logout: async (req, res, next) => {
        try {
            res.clearCookie('refreshtoken', { path: '/api/refresh_token' });
            return res.status(200).json(createRes.success('Đăng xuất thành công'));
        } catch (err) {
            return next(err);
        }
    },



    generateAccessToken: async (req, res, next) => {
        try {
            const rf_token = req.cookies.refreshtoken;
            if (!rf_token) {
                return next(createRes.error('Vui lòng đăng nhập lại.'))
            }
            jwt.verify(
                rf_token,
                process.env.REFRESH_TOKEN_SECRET,
                async (err, result) => {
                    if (err)
                        return next(createRes.error('Vui lòng đăng nhập lại.'))
                    const user = await Users.findById(result.id)
                        .select('-password')
                        .populate('saved', '');
                    if (!user)
                        return next(createRes.error('Tài khoản không tồn tại.'))
                    const accessToken = createAccessToken({ id: result.id });

                    res.status(200).json(createRes.success('Thành công', { accessToken, user }));
                }
            );
        } catch (err) {
            next(err);
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
