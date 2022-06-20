const createRes = require('../../utils/response_utils');
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
    createMessage: async (req, res,next) => {
        try {
            const { recipient, sender, text, media, call, icon, isRead } =
                req.body;
            if (!text && media?.length === 0 && !call && !icon) return;
            const newConversations = await Conversations.findOneAndUpdate(
                {
                    $or: [
                        { participants: [req.body.sender, req.body.recipient] },
                        { participants: [req.body.recipient, req.body.sender] },
                    ],
                },
                {
                    participants: [req.body.sender, req.body.recipient],
                    ...req.body
                },
                {
                    new: true,
                    upsert: true,
                }
            ).populate('participants', '_id avatar username fullname');

            const newMessage = new Messages({
                conversation: newConversations._id,
                ...req.body
            });

            await newMessage.save();

            return res.json(createRes.success('Thành công',{
                conversation: newConversations,
                message: newMessage,
            }));
        } catch (error) {
            return next(error)
        }
    },

    getMessages: async (req, res,next) => {
        try {
            const feature = new APIFeatures(
                Messages.find({
                    conversation: req.params.id
                }),
                req.query
            ).paginating();

            const messages = await feature.query
                .sort('-createdAt');

            return res.json(createRes.success('Thành công!',{
                _id: req.params.id,
                messages,
                pagination: {...req.query,count: messages.length}
            }));
        } catch (error) {
            return next(error);
        }
    },
    updateConversation: async (req, res) => {
        try {
            const conversation = await Conversations.findOneAndUpdate(
                {
                    $or: [
                        { participants: [req.user._id, req.params.id] },
                        { participants: [req.params.id, req.user._id] },
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
                .populate('participants', '_id avatar username fullname');
            res.json(createRes.success('Thành công!',conversation));
        } catch (error) {
            return res.status(500).json({ message: err.message });
        }
    },

    getConversations: async (req, res,next) => {
        try {
            const feature = new APIFeatures(
                Conversations.find({
                    participants: req.user._id,
                }),
                req.query
            ).paginating();
            const conversations = await feature.query
                .sort('-updatedAt')
                .populate('participants', '_id avatar username fullname');
            return res.json(createRes.success('Thành công!',conversations,
            ))
        } catch (err) {
            return next(err);
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
