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
    searchUser: async (req, res,next) => {
        try {
            const users = await Users.find({
                $and: [
                    { username: { $regex: req.query.username } },
                    { username: { $ne: req.user.username } },
                ],
            })
                .limit(10)
                .select('username avatar fullname');
            return res.status(200).json(createRes.success('Thành công',users));
        } catch (error) {
            return next(error);
        }
    },
    getUser: async (req, res,next) => {
        try {
            const user = await Users.findById(req.params.id)
                .select('-password')
            if (!user)
                return next(createRes.error('Người dùng không tồn tại'))

            
            return res.json(createRes.success('Thành công!',user));
        } catch (error) {
            next(error);
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
    follow: async (req, res,next) => {
        try {
            const user = await Users.findOne({
                _id: req.params.id,
                followers: req.user._id,
            });
            if (user)
                next(createRes.error('Bạn đã theo dõi tài khoản này rồi.'))
                
            const follower = await Users.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { followers: req.user._id } },
                { new: true }
            ).select('-password')
            const following = await Users.findOneAndUpdate(
                { _id: req.user._id },
                { $push: { following: req.params.id } },
                { new: true }
            ).select('-password')

            return res.json(createRes.success('Follow thành công',{follower,following}));
        } catch (error) {
            next(error)
        }
    },
    unFollow: async (req, res,next) => {
        try {
            const user = await Users.findOne({
                _id: req.params.id,
                followers: req.user._id,
            });
            if (!user)
                return next(createRes.error('Bạn chưa theo dõi tài khoản này.'))
                const follower = await Users.findOneAndUpdate(
                { _id: req.params.id },
                { $pull: { followers: req.user._id } },
                { new: true }
            ).select('-password')
            const following = await Users.findOneAndUpdate(
                { _id: req.user._id },
                { $pull: { following: req.params.id } },
                { new: true }
            ).select('-password')

            return res.json(createRes.success('Unfollow thành công',{follower,following}));
        } catch (error) {
            return next(error);
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

    updateUserSetting : async (req, res,next)=>{
        try {
            const data = req.body;
            const currentSetting = req.user.userSettings;
            const newSettings ={...currentSetting,...data};
            const newUser = await Users.findOneAndUpdate({_id: req.user._id}, {
                userSettings: newSettings,
            },{
                new: true
            });

            return res.json(createRes.success('Thành công',newUser));

        } catch (error) {
            next(error);
            
        }
    }
};

module.exports = userController;
