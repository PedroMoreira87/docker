const express = require('express');
const postController = require('../controllers/postController');
const authController = require("../controllers/authController");

const router = express.Router();

router.route('/')
    .get(authController.authenticateToken, postController.getAllPosts)
    .post(authController.authenticateToken, postController.createPost);

router.route('/:id')
    .get(authController.authenticateToken, postController.getOnePost)
    .patch(authController.authenticateToken, postController.updatePost)
    .delete(authController.authenticateToken, postController.deletePost);

module.exports = router;
