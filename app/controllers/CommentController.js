const Comments = require('../modules/comment');
const Posts = require('../modules/post');

const CommentController = {
    createComment: async (req, res) => {
        try {
            const comment = req.body.comment;
            const post = await Posts.findOne({ _id: comment.postId });
            if (!post)
                return res
                    .status(400)
                    .json({ message: 'Không có bài đăng này.' });
            comment.user = req.user._id;
            const newComment = new Comments({
                content: comment.content,
                user: req.user._id,
                postId: post._id,
                postUserId: post.user._id,
                tag: comment.tag,
                reply: comment.reply,
            });
            await newComment.save();

            const newPost = await Posts.findOneAndUpdate(
                { _id: comment.postId },
                {
                    $push: { comments: newComment._id },
                },
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
            return res.status(200).json({
                message: 'Bình luận thành công!',
                comment: newComment,
                post: newPost,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteComment: async (req, res) => {
        try {
            const comments = await Comments.find({
                $or: [
                    {
                        _id: req.params.id,
                        $or: [
                            { user: req.user._id },
                            { postUserId: req.user._id },
                        ],
                    },
                    { reply: req.params.id },
                ],
            });
            if (!comments)
                return res
                    .status(400)
                    .json({ message: 'Bình luận không tồn tại.' });
            await Comments.deleteMany({
                _id: { $in: comments },
            });

            const post = await Posts.findOneAndUpdate(
                { _id: comments[0].postId },
                {
                    $pullAll: {
                        comments: comments,
                    },
                }
            );

            return res.json({ message: 'Comment Deleted', post, comments });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    likeComment: async (req, res) => {
        const comment = await Comments.findOne({
            _id: req.params.id,
            likes: req.user._id,
        });
        if (comment)
            return res
                .status(400)
                .send({ message: 'Bạn đã like bình luận này rồi.' });
        const newComment = await Comments.findOneAndUpdate(
            { _id: req.params.id },
            {
                $push: {
                    likes: req.user._id,
                },
            },
            { new: true }
        ).populate('user likes', 'avatar username fullname followers');

        return res.json({ newComment, message: 'Like bình luận thành công.' });
    },
    unlikeComment: async (req, res) => {
        const comment = await Comments.findOne({
            _id: req.params.id,
            likes: req.user._id,
        });
        if (!comment)
            return res
                .status(400)
                .send({ message: 'Bạn chưa like bình luận này rồi.' });
        const newComment = await Comments.findOneAndUpdate(
            { _id: req.params.id },
            {
                $pull: {
                    likes: req.user._id,
                },
            },
            { new: true }
        ).populate('user likes', 'avatar username fullname followers');

        return res.json({
            newComment,
            message: 'Unlike bình luận thành công.',
        });
    },
};

module.exports = CommentController;
