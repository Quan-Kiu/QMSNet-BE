const Users = require('../modules/user');
const bcrypt = require('bcrypt');
const createRes = require('../../utils/response_utils');
const userController = {
    getAllUser: async (req, res) => {
        const lstUser = await Users.find({
            username: { $ne: req.user.username },
        }).limit(5);
        return res.json({
            lstUser,
        });
    },
    searchUser: async (req, res) => {
        try {
            const users = await Users.find({
                $and: [
                    { username: { $regex: req.query.username } },
                    { username: { $ne: req.user.username } },
                ],
            })
                .limit(10)
                .select('username avatar fullname');
            return res.status(200).json({ users });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    getUser: async (req, res) => {
        try {
            const user = await Users.findById(req.params.id)
                .select('-password')
                .populate('followers following', '-password');
            if (!user)
                return res.status(400).json({ message: 'User not found' });

            return res.json(user);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    changeAvatar: async (req, res) => {
        const { newAvatar } = req.body;

        try {
            if (!newAvatar)
                return res.status(400).json({ message: 'File does not exist' });
            await Users.findOneAndUpdate(
                { _id: req.user._id },
                { avatar: newAvatar.url }
            );
            return res.status(200).json({ message: 'susses' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    updateUser: async (req, res,next) => {
        const newValues = req.body;

        try {
            const newInfo = await Users.findByIdAndUpdate(req.user._id, newValues,{
                new: true
            });
            return res.status(200).json(createRes.success('Chỉnh sửa thành công!',newInfo))
        } catch (error) {
            return next(error)
        }
    },
    changePassword: async (req, res) => {
        try {
            const { oldPassword, password, confirmPassword } = req.body;

            const isPasswordMatch = await bcrypt.compare(
                oldPassword,
                req.user.password
            );
            if (!isPasswordMatch)
                return res
                    .status(400)
                    .json({ message: 'Old Password is not correct' });

            if (password !== confirmPassword)
                return res
                    .status(400)
                    .json({ message: 'Confirm password does not match' });

            if (password.length < 6)
                return res.status(400).json({
                    message: 'Password must be at least 6 characters.',
                });

            const hasPassword = await bcrypt.hash(password, 12);

            await Users.findByIdAndUpdate(user._id, { password: hasPassword });

            return res
                .status(200)
                .json({ message: 'Password updated successfully' });
        } catch (error) {
            return res.status(500).json({
                message: error.message,
            });
        }
    },
    follow: async (req, res) => {
        try {
            const user = await Users.findOne({
                _id: req.params.id,
                followers: req.user._id,
            });
            if (user)
                return res
                    .status(400)
                    .json({ message: 'Bạn đã theo dõi tài khoản này rồi.' });
            await Users.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { followers: req.user._id } },
                { new: true }
            );
            await Users.findOneAndUpdate(
                { _id: req.user._id },
                { $push: { following: req.params.id } },
                { new: true }
            );

            return res.json({ message: 'Follow Success' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    unFollow: async (req, res) => {
        try {
            const user = await Users.findOne({
                _id: req.params.id,
                followers: req.user._id,
            });
            if (!user)
                return res
                    .status(400)
                    .json({ message: 'Bạn chưa theo dõi tài khoản này.' });

            await Users.findOneAndUpdate(
                { _id: req.params.id },
                { $pull: { followers: req.user._id } },
                { new: true }
            );
            await Users.findOneAndUpdate(
                { _id: req.user._id },
                { $pull: { following: req.params.id } },
                { new: true }
            );

            return res.json({ message: 'UnFollow Success' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    suggestionsUser: async (req, res) => {
        try {
            const newArr = [...req.user.following, req.user._id];

            const num = req.query.num || 50;

            const users = await Users.aggregate([
                { $match: { _id: { $nin: newArr } } },
                { $sample: { size: Number(num) } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'followers',
                        foreignField: '_id',
                        as: 'followers',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'following',
                        foreignField: '_id',
                        as: 'following',
                    },
                },
            ]).project('-password');

            return res.json({
                users,
                total: users.length,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = userController;
