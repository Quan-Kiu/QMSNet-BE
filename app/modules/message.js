const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        conversation: { type: mongoose.Types.ObjectId, ref: 'Conversation' },
        sender: { type: mongoose.Types.ObjectId, ref: 'User' },
        recipient: { type: mongoose.Types.ObjectId, ref: 'User' },
        text: String,
        media: {
            type: {url: String,public_id: String}
        },
        call: Object,
        icon: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Message', messageSchema);
