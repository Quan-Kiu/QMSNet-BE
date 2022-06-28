const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');


const postSchema = new mongoose.Schema(
    {
        content: String,
        media: [{
            public_id: String,
            url: String,
        }],
        likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
        comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
        user: { type: mongoose.Types.ObjectId, ref: 'User' },
        status: Number,
        styles: {
            background: String,
            color: String
        },
        disableComment: {
            type: Boolean,
            default: false,
        },
    },

    {
        timestamps: true,
    }
);

postSchema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: "all" });


module.exports = mongoose.model('Post', postSchema);
