const createRes = require('../../utils/response_utils');
const Comments = require('../modules/comment');
const Posts = require('../modules/post');

const CommentController = {
    createComment: async (req, res,next) => {
        try {
            const comment = req.body;
            const post = await Posts.findOne({ _id: comment.postId });
            if (!post)
                return next(createRes.error('Không có bài đăng này.'))
            comment.user = req.user._id;
            const newComment = new Comments({
                content: comment.content,
                user: req.user._id,
                postId: post._id,
                postUserId: post.user._id,
                tag: comment?.tag,
                reply: comment?.reply,
            });
            await newComment.save();

            const newPost = await Posts.findOneAndUpdate(
                { _id: comment.postId },
                {
                    $push: { comments: newComment._id },
                },
                { new: true }
            )
                .populate('user', 'avatar username fullname followers')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user',
                        select: '-password',
                    },
                });
            return res.status(200).json(createRes.success('Thành công',newPost));
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteComment: async (req, res,next) => {
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
            return next(createRes.error( 'Bình luận không tồn tại.'))
              
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
                ,{
                    new: true,
                }
            );

            return res.status(200).json(createRes.success('Thành công',post));
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    likeComment: async (req, res,next) => {
        const comment = await Comments.findOne({
            _id: req.params.id,
            likes: req.user._id,
        });
        if (comment){
            return next(createRes.error( 'Bạn đã like bình luận này rồi.' ))
        }
           
        const newComment = await Comments.findOneAndUpdate(
            { _id: req.params.id },
            {
                $push: {
                    likes: req.user._id,
                },
            })
        const post = await Posts.findOne({_id: newComment.postId}).populate('user', 'avatar username fullname followers')
        .populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: '-password',
            },
        });;
        return res.status(200).json(createRes.success('Thành công',post));
    },
    unlikeComment: async (req, res,next) => {
        const comment = await Comments.findOne({
            _id: req.params.id,
            likes: req.user._id,
        });
        if (!comment)
     
                return next(createRes.error( 'Bạn chưa like bình luận này rồi.'))
        const newComment = await Comments.findOneAndUpdate(
            { _id: req.params.id },
            {
                $pull: {
                    likes: req.user._id,
                },
            })
        const post = await Posts.findOne({_id: newComment.postId}).populate('user', 'avatar username fullname followers')
        .populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: '-password',
            },
        });;
        return res.status(200).json(createRes.success('Thành công',post));
       
    },
};

module.exports = CommentController;
