const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const userController = require('../app/controllers/UserController');

router.patch('/user/changeavatar', auth, userController.changeAvatar);
router.patch('/user/updateuser', auth, userController.updateUser);
router.patch('/user/changepassword', auth, userController.changePassword);
router.patch('/user/follow/:id', auth, userController.follow);
router.patch('/user/unfollow/:id', auth, userController.unFollow);
router.get('/search', auth, userController.searchUser);
router.get('/user/all', auth, userController.getAllUser);
router.get('/user/suggestions', auth, userController.suggestionsUser);
router.get('/user/:id', auth, userController.getUser);
module.exports = router;
