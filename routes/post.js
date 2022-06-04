const express = require('express');
const router = express.Router();
const PostController = require('../app/controllers/PostController');
const auth = require('../middlewares/auth');

router.post('/posts/create', auth, PostController.createPost);
router.get('/posts/', auth, PostController.getPosts);
router.get('/post/:id', auth, PostController.getPostById);
router.get('/posts/getByUser/:id', auth, PostController.getPostsByUser);
router.get('/posts/getPostsExplore', auth, PostController.getPostsExplore);
router.get(
    '/posts/getSavedByUser/:id',
    auth,
    PostController.getPostSavedByUser
);
router.patch('/post/:id/like', auth, PostController.likePost);
router.patch('/post/:id/unlike', auth, PostController.unlikePost);
router.patch('/post/:id/save', auth, PostController.savePost);
router.patch('/post/:id/unsave', auth, PostController.unsavePost);
router.delete('/post/:id/delete', auth, PostController.deletePost);

module.exports = router;
