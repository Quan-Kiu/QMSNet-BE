const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            maxLength: 2000,
            required: true,
        },
        tag: Object,
        likes: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
                default: [],
            },
        ],
        reply: mongoose.Types.ObjectId,
        user: { type: mongoose.Types.ObjectId, ref: 'User' },
        postId: mongoose.Types.ObjectId,
        postUserId: mongoose.Types.ObjectId,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Comment', commentSchema);
