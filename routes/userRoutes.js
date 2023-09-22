const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadImage = require('../middlewares/uploadImageUser');

const router = express.Router();

router.use(authMiddleware.isLoggedIn);
router.patch(
    '/update-me',
    uploadImage.uploadUserPhoto,
    uploadImage.resizeUserPhoto,
    userController.updateMe,
);
router.delete('/delete-me', userController.deleteMe);
router.route('/me').get(userController.getMe, userController.getUser);
router.patch('/update-my-password', authController.updateMyPassword);

router.use(authMiddleware.redirectTo('admin'));
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
