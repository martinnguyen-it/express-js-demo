const express = require('express');
const tourController = require('../controllers/tourController');
const authMiddleware = require('../middlewares/authMiddleware');
const tourMiddleware = require('../middlewares/tourMiddleware');
const uploadImage = require('../middlewares/uploadImageTour');
const reviewRouter = require('./reviewRoutes');
// const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);

router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances);

router
    .route('/top-5-cheapest')
    .get(tourMiddleware.aliasTopTour, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
    .route('/monthly-plan/:year')
    .get(
        authMiddleware.isLoggedIn,
        authMiddleware.redirectTo('admin', 'lead-guide', 'guide'),
        tourController.getMonthlyPlan,
    );

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authMiddleware.isLoggedIn,
        authMiddleware.redirectTo('admin', 'lead-guide'),
        uploadImage.uploadTourImages,
        uploadImage.resizeTourImages,
        tourController.createTour,
    );

router.route('/me').get(authMiddleware.isLoggedIn, tourController.getMyTour);

router.route('/slug/:slug').get(tourController.getTourBySlug);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authMiddleware.isLoggedIn,
        authMiddleware.redirectTo('admin', 'lead-guide'),
        uploadImage.uploadTourImages,
        uploadImage.resizeTourImages,
        tourController.updateTour,
    )
    .delete(
        authMiddleware.isLoggedIn,
        authMiddleware.redirectTo('admin', 'lead-guide'),
        tourController.deleteTour,
    );

module.exports = router;
