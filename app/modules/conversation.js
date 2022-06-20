const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        participants: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
        text: String,
        media: {
            type: {url: String,public_id: String}
        },
        icon: { type: Boolean, default: false },
        call: Object,
        isRead: Boolean,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Conversation', conversationSchema);
