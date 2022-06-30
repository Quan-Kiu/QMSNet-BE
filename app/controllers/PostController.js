const Posts = require('../modules/post');
const Users = require('../modules/user');
const Comments = require('../modules/comment');
const Notifies = require('../modules/notify');
const createRes = require('../../utils/response_utils');

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
    createPost: async (req, res, next) => {
        try {
            if (req.body?.media?.length <= 0 && !req.body.content.trim()) {
                next(createRes.error('Vui lòng nhập nội dung bài viết!'));
            }
            if (req.body?.media?.length <= 0 && req.body.content.trim().length < 10) {
                next(createRes.error('Nội dung bài viết ít nhất 10 ký tự!'));
            }
            const newPost = new Posts({
                ...req.body,
                user: req.user._id,
            });
            await newPost.save();

            res.json(createRes.success('Đã chia sẻ bài viết của bạn.', {
                post: newPost,
                user: req.user,
            }));
        } catch (error) {
            return next(error);
        }
    },
    updatePost: async (req, res, next) => {
        try {
            if (req.body?.media?.length <= 0 && !req.body.content.trim()) {
                next(createRes.error('Vui lòng nhập nội dung bài viết!'));
            }
            if (req.body?.media?.length <= 0 && req.body.content.trim().length < 10) {
                next(createRes.error('Nội dung bài viết ít nhất 10 ký tự!'));
            }
            const newPost = await Posts.findOneAndUpdate({ _id: req.params.id }, {
                ...req.body,
            }, {
                new: true
            }).populate('user', '-password')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user',
                        select: '-password',
                    },


                });;


            res.json(createRes.success('Chỉnh sửa bài viết thành công.',
                newPost
            ));
        } catch (error) {
            return next(error);
        }
    },

    deletePost: async (req, res, next) => {
        const post = await Posts.findOne({ _id: req.params.id });
        if (!post)
            return next(createRes.error('Bài viết này không tồn tại'))
        Posts.deleteById(
            req.params.id).exec(async function (err, result) {
                if (err)
                    return next(err)
                await Comments.deleteMany({ _id: { $in: post.comments } });
                return res.json(createRes.success('Xóa bài đăng thành công.', post));

            })

    },

    getPosts: async (req, res, next) => {
        try {
            const features = new APIFeatures(
                Posts.find({
                    $or: [{
                        user: [...req.user.following, '62bd4800bfda3cce913e51e8'],
                        status: 1,

                    }, {
                        user: req.user._id
                    }]
                }),
                req.query
            ).paginating();
            const posts = await features.query
                .sort('-createdAt')
                .populate({
                    path: 'user',
                    select: '-password'
                })
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user',
                        select: '-password',
                    },


                });
            return res.json(createRes.success('Thành công', {
                posts, pagination: {
                    page: req?.query?.page,
                    limit: req?.query?.limit,
                    count: posts.length,
                }
            }));
        } catch (error) {
            return next(error);
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

    getPostById: async (req, res, next) => {
        try {
            const post = await Posts.findOne({ _id: req.params.id })
                .populate('user', '-password')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user',
                        select: '-password',
                    },
                });
            if (!post)
                return next(createRes.error('Không tồn tại bài đăng này.'))

            if (post.user._id.toString() !== req.user._id.toString()) {
                if (post.status === 2) {
                    return next(createRes.error('Không tồn tại bài đăng này.'))

                }
            }

            return res.json(createRes.success('Thành công', post));
        } catch (error) {
            return next(error);
        }
    },

    getPostsByUser: async (req, res) => {
        try {
            req.query.limit = 10;
            let data;
            if (req.user._id.toString() === req.params.id) {
                data = await Posts.find(
                    {
                        user: req.params.id,
                    }).sort('-createdAt')
                    .populate('user', '-password')
                    .populate({
                        path: 'comments',
                        populate: {
                            path: 'user',
                            select: '-password',
                        },
                    });

            } else {
                data = await Posts.find(
                    {
                        user: req.params.id,
                        status: 1
                    }).sort('-createdAt')
                    .populate('user', '-password')
                    .populate({
                        path: 'comments',
                        populate: {
                            path: 'user',
                            select: '-password',
                        },
                    });
            }


            const total = data.length;

            const feature = new APIFeatures(data, req.query).paginating(true);

            const posts = feature.query;

            return res.json(createRes.success('Thành công', { posts, total }));
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    likePost: async (req, res, next) => {
        try {
            const post = await Posts.findOne({
                _id: req.params.id,
                status: 1
            });
            if (!post)
                return next(createRes.error('Không tồn tại bài đăng này, hoặc bài viết đang ở chế độ riêng tư không thể tương tác.'))
            if (post.likes.includes(req.user._id))
                return next(createRes.error('Bạn đã like bài đăng này rồi.'))
            const isAuthorLiked = post.likes.includes(post.user);
            let newPost;
            if (post.user.toString() === req.user._id.toString()) {
                newPost = await Posts.findOneAndUpdate(
                    { _id: req.params.id },
                    { $push: { likes: req.user._id } },
                    { new: true }
                )
                    .populate('user', '-password')
                    .populate({
                        path: 'comments',
                        populate: {
                            path: 'user',
                            select: '-password',
                        },
                    })
            } else {
                const [res] = await Promise.all([Posts.findOneAndUpdate(
                    { _id: req.params.id },
                    { $push: { likes: req.user._id } },
                    { new: true }
                )
                    .populate('user', '-password')
                    .populate({
                        path: 'comments',
                        populate: {
                            path: 'user',
                            select: '-password',
                        },
                    }), Notifies.findOneAndUpdate({
                        postId: req.params.id,
                    }, {
                        text: `${post.likes.length === 0 ? 'đã thích bài viết của bạn.' : post.likes.length === 1 ? isAuthorLiked ? 'đã thích bài viết của bạn.' : 'và 1 người khác đã thích bài viết của bạn.' : isAuthorLiked ? `và ${post.likes.length - 1} người khác đã thích bài viết của bạn.` : `và ${post.likes.length} người khác đã thích bài viết của bạn.`} `,
                        content: post?.content,
                        media: post?.media,
                        postId: post?._id,
                        user: req.user,
                        recipients: [post.user],
                        isRead: false,
                        action: 2,
                    }, {
                        upsert: true,
                    }).populate('user', '-password')])
                newPost = res;
            }

            return res.json(createRes.success('Thích bài viết thành công!', newPost));

        } catch (error) {
            return next(error);
        }
    },
    unlikePost: async (req, res, next) => {
        try {
            const post = await Posts.findOne({
                _id: req.params.id,
                status: 1

            });
            if (!post)
                return next(createRes.error('Không tồn tại bài đăng này.'))
            if (!(post.likes.includes(req.user._id)))
                return next(createRes.error('Bạn chưa like bài đăng này.'))

            const newPost = await Posts.findOneAndUpdate(
                { _id: req.params.id },
                { $pull: { likes: req.user._id } },
                { new: true }
            )
                .populate('user likes', '-password')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user',
                        select: '-password',
                    },
                });

            return res.json(createRes.success('Hủy thích bài viết thành công!', newPost));
        } catch (error) {
            return next(error);
        }
    },
    disableCommentPost: async (req, res, next) => {
        try {
            const post = await Posts.findOne({
                _id: req.params.id,

            });
            if (!post)
                return next(createRes.error('Không tồn tại bài đăng này.'))

            const newPost = await Posts.findOneAndUpdate(
                { _id: req.params.id },
                { disableComment: !post.disableComment },
                { new: true }
            )
                .populate('user likes', '-password')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user',
                        select: '-password',
                    },
                });

            return res.json(createRes.success('Thành công!', newPost));
        } catch (error) {
            return next(error);
        }
    },
    savePost: async (req, res, next) => {
        try {
            const user = await Users.findOne({
                _id: req.user._id,
                saved: req.params.id,
            });
            if (user)
                return next(createRes.error('Bạn đã lưu bài đăng này rồi.'))
            const newUser = await Users.findOneAndUpdate(
                { _id: req.user._id },
                {
                    $push: { saved: req.params.id },
                }
                , {
                    new: true
                }
            ).select('-password')
                .populate('saved', '');;
            return res.json(createRes.success('Lưu bài đăng thành công', newUser));
        } catch (error) {
            return next(err);
        }
    },
    unsavePost: async (req, res, next) => {
        try {
            const user = await Users.findOne({
                _id: req.user._id,
                saved: req.params.id,
            });
            if (!user)
                return next(createRes.error('Bạn chưa lưu bài đăng này.'))

            const newUser = await Users.findOneAndUpdate(
                { _id: req.user._id },
                {
                    $pull: { saved: req.params.id },
                }
                , {
                    new: true
                }
            ).select('-password')
                .populate('saved', '');;
            return res.json(createRes.success('Hủy lưu bài đăng thành công', newUser));
        } catch (error) {
            return next(err);
        }
    },

    getPostSavedByUser: async (req, res, next) => {
        try {
            const user = await Users.findOne({ _id: req.params.id });
            if (!user)
                return next(createRes.error('Người dùng không tồn tại.'))

            const posts = await Posts.find({
                _id: {
                    $in: user.saved,
                },
            });
            return res.json(createRes.error('Thành công', posts));
        } catch (error) {
            next(error)
        }
    },
};

module.exports = PostController;
