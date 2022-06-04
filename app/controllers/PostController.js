const Posts = require('../modules/post');
const Users = require('../modules/user');
const Comments = require('../modules/comment');

class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    paginating(isData) {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 20;
        const skip = (page - 1) * limit;
        if (isData) {
            this.query = this.query.splice(skip, limit);
        } else {
            this.query = this.query.skip(skip).limit(limit);
        }
        return this;
    }
}

const PostController = {
    createPost: async (req, res) => {
        try {
            const { content, images } = req.body;
            if (images.length <= 0)
                return res
                    .status(400)
                    .json({ message: 'Vui lòng thêm hình ảnh.' });

            const newPost = new Posts({
                content,
                images,
                user: req.user._id,
            });
            await newPost.save();

            res.json({
                message: 'Đã chia sẻ bài viết của bạn.',
                post: newPost,
                user: req.user,
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    deletePost: async (req, res) => {
        try {
            const post = await Posts.findByIdAndDelete({
                _id: req.params.id,
                user: req.user._id,
            });
            if (!post)
                return res
                    .status(400)
                    .json({ message: 'Không tồn tại bài đăng này.' });
            await Comments.deleteMany({ _id: { $in: post.comments } });
            return res.json({ message: 'Xóa bài đăng thành công.', post });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getPosts: async (req, res) => {
        try {
            const features = new APIFeatures(
                Posts.find({
                    user: [...req.user.following, req.user._id,'61c548e06d529141c410df4a'],
                }),
                req.query
            ).paginating();
            const posts = await features.query
                .sort('-createdAt')
                .populate('user likes', 'avatar username fullname followers')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user likes',
                        select: '-password',
                    },
                });
            return res.json({ message: 'Success', total: posts.length, posts });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    getPostsExplore: async (req, res) => {
        try {
            const newArr = [...req.user.following, req.user._id];

            const num = req.query.num || 9;

            const posts = await Posts.aggregate([
                { $match: { user: { $nin: newArr } } },
                { $sample: { size: Number(num) } },
            ]);

            return res.json({
                message: 'Success!',
                total: posts.length,
                posts,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getPostById: async (req, res) => {
        try {
            const post = await Posts.findOne({ _id: req.params.id })
                .populate('user likes', 'avatar username fullname followers')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user likes',
                        select: '-password',
                    },
                });

            if (!post)
                return res
                    .status(400)
                    .json({ message: 'Không tồn tại bài đăng này.' });

            return res.json({ post, message: 'Thành công' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getPostsByUser: async (req, res) => {
        try {
            req.query.limit = 12;
            const data = await Posts.find({
                user: req.params.id,
            }).sort('-createdAt');
            const total = data.length;

            const feature = new APIFeatures(data, req.query).paginating(true);

            const posts = feature.query;

            return res.json({ posts, user: req.params.id, total });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    likePost: async (req, res) => {
        try {
            const post = await Posts.findOne({
                _id: req.params.id,
                likes: req.user._id,
            });
            if (post)
                return res
                    .status(400)
                    .json({ message: 'Bạn đã like bài đăng này rồi.' });

            const newPost = await Posts.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { likes: req.user._id } },
                { new: true }
            )
                .populate('user likes', 'avatar username fullname followers')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user likes',
                        select: '-password',
                    },
                });

            return res.json({ message: 'Like Success.', post: newPost });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    unlikePost: async (req, res) => {
        try {
            const post = await Posts.findOne({
                _id: req.params.id,
                likes: req.user._id,
            });
            if (!post)
                return res
                    .status(400)
                    .json({ message: 'Bạn chưa like bài đăng này.' });

            const newPost = await Posts.findOneAndUpdate(
                { _id: req.params.id },
                { $pull: { likes: req.user._id } },
                { new: true }
            )
                .populate('user likes', 'avatar username fullname followers')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user likes',
                        select: '-password',
                    },
                });

            return res.json({ message: 'Unlike Success.', post: newPost });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    savePost: async (req, res) => {
        try {
            const user = await Users.findOne({
                _id: req.user._id,
                saved: req.params.id,
            });
            if (user)
                return res
                    .status(400)
                    .json({ message: 'Bạn đã lưu bài đăng này rồi.' });
            await Users.findOneAndUpdate(
                { _id: req.user._id },
                {
                    $push: { saved: req.params.id },
                }
            );
            return res.json({ message: 'Lưu bài đăng thành công!' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    unsavePost: async (req, res) => {
        try {
            const user = await Users.findOne({
                _id: req.user._id,
                saved: req.params.id,
            });
            if (!user)
                return res
                    .status(400)
                    .json({ message: 'Bạn chưa lưu bài đăng này.' });
            await Users.findOneAndUpdate(
                { _id: req.user._id },
                {
                    $pull: { saved: req.params.id },
                }
            );
            return res.json({ message: 'Hủy Lưu bài đăng thành công!' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getPostSavedByUser: async (req, res) => {
        try {
            const user = await Users.findOne({ _id: req.params.id });
            if (!user)
                return res
                    .status(400)
                    .json({ message: 'Tài khoản này không tồn tại.' });

            const posts = await Posts.find({
                _id: {
                    $in: user.saved,
                },
            });
            return res.json({ posts, user: req.params.id });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
};

module.exports = PostController;
