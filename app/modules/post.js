const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        content: String,
        images: {
            type: Array,
            required: true,
        },
        likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
        comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
        user: { type: mongoose.Types.ObjectId, ref: 'User' },
        disableComment: {
            type: Boolean,
            default: false,
        },
    },

    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Post', postSchema);
