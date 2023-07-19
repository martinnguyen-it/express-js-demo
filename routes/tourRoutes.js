const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
// const reviewController = require('../controllers/reviewController');

const router = express.Router();

// router.param('id', tourController.checkId);

// router
//     .route('/:tourId/reviews')
//     .post(authController.isLoggedIn, reviewController.createReview);

router.use('/:tourId/reviews', reviewRouter);

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);

router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances);

router
    .route('/top-5-cheapest')
    .get(tourController.aliasTopTour, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
    .route('/monthly-plan/:year')
    .get(
        authController.isLoggedIn,
        authController.redirectTo('admin', 'lead-guide', 'guide'),
        tourController.getMonthlyPlan,
    );

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.isLoggedIn,
        authController.redirectTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.createTour,
    );

router.route('/me').get(authController.isLoggedIn, tourController.getMyTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.isLoggedIn,
        authController.redirectTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour,
    )
    .delete(
        authController.isLoggedIn,
        authController.redirectTo('admin', 'lead-guide'),
        tourController.deleteTour,
    );

module.exports = router;
