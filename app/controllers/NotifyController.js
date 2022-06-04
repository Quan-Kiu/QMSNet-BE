const Notifies = require('../modules/notify');

const NotifyController = {
    createNotify: (req, res) => {
        try {
            const { id, recipients, url, text, content, image } = req.body;

            if (recipients.includes(req.user._id.toString())) return;
            recipients.forEach(async (item) => {
                const notify = new Notifies({
                    id,
                    recipients: [item],
                    url,
                    text,
                    content,
                    image,
                    user: req.user._id,
                });

                await notify.save();
            });

            return res.json({ message: 'Success' });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getNotifies: async (req, res) => {
        try {
            const notifies = await Notifies.find({ recipients: req.user._id })
                .sort('-createdAt')
                .populate('user', 'avatar username')
                .limit(30);

            return res.json({ notifies });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    isReadNotify: async (req, res) => {
        try {
            const notifies = await Notifies.findOneAndUpdate(
                { _id: req.params.id },
                {
                    isRead: true,
                }
            );

            return res.json({ notifies });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = NotifyController;
