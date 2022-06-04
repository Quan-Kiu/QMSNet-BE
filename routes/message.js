const express = require('express');
const router = express.Router();
const MessageController = require('../app/controllers/MessageController');
const auth = require('../middlewares/auth');
router.post('/message/create', auth, MessageController.createMessage);
router.get('/conversations', auth, MessageController.getConversations);
router.get('/message/:id', auth, MessageController.getMessages);
router.get(
    '/message/updateconversation/:id',
    auth,
    MessageController.updateConversation
);
router.delete('/message/:id/delete', auth, MessageController.deleteMessage);
router.delete(
    '/conversation/:id/delete',
    auth,
    MessageController.deleteConversation
);

module.exports = router;
