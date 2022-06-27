const express = require('express');
const NotifyController = require('../app/controllers/NotifyController');
const router = express.Router();
const auth = require('../middlewares/auth');

router.post('/notify/create', auth, NotifyController.createNotify);
router.get('/notify', auth, NotifyController.getNotifies);
router.get('/notify/readAll', auth, NotifyController.readAll);
router.get('/notify/:id', auth, NotifyController.isReadNotify);

module.exports = router;
