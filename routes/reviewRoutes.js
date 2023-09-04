const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const reviewController = require('../controllers/reviewController');
const reviewMiddleware = require('../middlewares/reviewMiddleware');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(reviewMiddleware.getReviewFilter, reviewController.getAllReviews)
    .post(
        authMiddleware.isLoggedIn,
        reviewMiddleware.setTourUserId,
        reviewController.createReview,
    );

router.use(authMiddleware.isLoggedIn);
router
    .route('/me/:id')
    .delete(reviewController.deleteReviewMe)
    .patch(reviewController.updateReviewMe);

router
    .route('/:id')
    .get(reviewController.getReview)
    .delete(
        authMiddleware.isLoggedIn,
        authMiddleware.redirectTo('admin', 'guide'),
        reviewController.deleteReview,
    )
    .patch(
        authMiddleware.isLoggedIn,
        authMiddleware.redirectTo('admin'),
        reviewController.updateReview,
    );
module.exports = router;
