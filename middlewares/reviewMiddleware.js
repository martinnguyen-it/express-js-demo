const isArray = require('lodash/isArray');

exports.setTourUserId = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (isArray(req.body.tour)) req.body.tour = req.body.tour[0];
    req.body.user = req.user.id;
    next();
};

exports.getReviewFilter = (req, res, next) => {
    if (req.params.tourId) req.filter = { tour: req.params.tourId };
    next();
};
