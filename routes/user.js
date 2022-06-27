const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const userController = require('../app/controllers/UserController');

router.patch('/users/changeavatar', auth, userController.changeAvatar);
router.patch('/users/updateuser', auth, userController.updateUser);
router.patch('/users/changepassword', auth, userController.changePassword);
router.patch('/users/follow/:id', auth, userController.follow);
router.patch('/users/unFollow/:id', auth, userController.unFollow);
router.get('/search', auth, userController.searchUser);
router.get('/users/all', auth, userController.getAllUser);
router.get('/users/suggestions', auth, userController.suggestionsUser);
router.get('/users/requests', auth, userController.requests);
router.get('/users/:id', auth, userController.getUser);
router.post('/users/userSettings', auth, userController.updateUserSetting);
module.exports = router;
