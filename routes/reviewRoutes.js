const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(reviewController.getReviewFilter, reviewController.getAllReviews)
    .post(
        authController.isLoggedIn,
        reviewController.setTourUserId,
        reviewController.createReview,
    );

router.use(authController.isLoggedIn);
router
    .route('/me/:id')
    .delete(reviewController.deleteReviewMe)
    .patch(reviewController.updateReviewMe);

router
    .route('/:id')
    .get(reviewController.getReview)
    .delete(
        authController.isLoggedIn,
        authController.redirectTo('admin'),
        reviewController.deleteReview,
    )
    .patch(
        authController.isLoggedIn,
        authController.redirectTo('admin'),
        reviewController.updateReview,
    );
module.exports = router;
