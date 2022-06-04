const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        recipients: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
        text: String,
        media: Array,
        icon: { type: Boolean, default: false },
        call: Object,
        isRead: Boolean,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Conversation', conversationSchema);
