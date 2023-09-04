exports.aliasTopTour = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'price,-ratingsAverage';
    next();
};
