const Conversations = require('../modules/conversation');
const Messages = require('../modules/message');

class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    paginating() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}
const MessageController = {
    createMessage: async (req, res) => {
        try {
            const { recipient, sender, text, media, call, icon, isRead } =
                req.body;
            if (!text && media.length === 0 && !call && !icon) return;
            const newConversations = await Conversations.findOneAndUpdate(
                {
                    $or: [
                        { recipients: [sender, recipient] },
                        { recipients: [recipient, sender] },
                    ],
                },
                {
                    recipients: [sender, recipient],
                    text,
                    media,
                    icon: icon ? true : false,
                    call,
                    isRead,
                },
                {
                    new: true,
                    upsert: true,
                }
            ).populate('recipients', '_id avatar username fullname');

            const newMessage = new Messages({
                conversation: newConversations._id,
                sender: newConversations.recipients[0],
                call,
                recipient: newConversations.recipients[1],
                text,
                media,
                icon,
            });

            await newMessage.save();

            return res.json({
                conversation: newConversations,
                message: newMessage,
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getMessages: async (req, res) => {
        try {
            const feature = new APIFeatures(
                Messages.find({
                    $or: [
                        { sender: req.user._id, recipient: req.params.id },
                        { sender: req.params.id, recipient: req.user._id },
                    ],
                }),
                req.query
            ).paginating();

            const messages = await feature.query
                .populate('sender', '_id avatar username fullname')
                .sort('-createdAt');

            return res.json({
                _id: req.params.id,
                messages,
                total: messages.length,
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    updateConversation: async (req, res) => {
        try {
            const conversation = await Conversations.findOneAndUpdate(
                {
                    $or: [
                        { recipients: [req.user._id, req.params.id] },
                        { recipients: [req.params.id, req.user._id] },
                    ],
                },
                {
                    isRead: true,
                },
                {
                    new: true,
                }
            )
                .select('-_id')
                .populate('recipients', '_id avatar username fullname');
            res.json({ conversation });
        } catch (error) {
            return res.status(500).json({ message: err.message });
        }
    },

    getConversations: async (req, res) => {
        try {
            const feature = new APIFeatures(
                Conversations.find({
                    recipients: req.user._id,
                }),
                req.query
            ).paginating();
            const conversations = await feature.query
                .sort('-updatedAt')
                .populate('recipients', '_id avatar username fullname');

            res.json({
                user: req.user._id,
                data: conversations,
                total: conversations.length,
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    deleteMessage: async (req, res) => {
        try {
            const deleted = await Messages.findOneAndDelete({
                _id: req.params.id,
                sender: req.user._id,
            });
            res.json({ deleted, message: 'Xóa tin nhắn thành công!' });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },
    deleteConversation: async (req, res) => {
        try {
            const deleted = await Conversations.findOneAndDelete({
                $or: [
                    { recipients: [req.user._id, req.params.id] },
                    { recipients: [req.params.id, req.user._id] },
                ],
            });
            if (!deleted) return;
            await Messages.deleteMany({
                conversation: deleted._id,
            });
            res.json({ deleted, message: 'Xóa cuộc trò chuyện thành công!' });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },
};

module.exports = MessageController;
