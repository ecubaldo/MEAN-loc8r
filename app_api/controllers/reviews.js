var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

var doSetAverageRating = function(location) {
    var i, reviewCount, ratingAverage, ratingTotal;
    if (location.reviews && location.reviews.length > 0) {
        reviewCount = location.reviews.length;
        ratingTotal = 0;
        for (i = 0; i < reviewCount; i++) {
            ratingTotal = ratingTotal + location.reviews[i].rating;
        }
        ratingAverage = parseInt(ratingTotal / reviewCount, 10);
        location.rating = ratingAverage;
        location.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Average rating updated to", ratingAverage);
            }
        });
    }
};

var updateAverageRating = function(locationid) {
    console.log("Update rating average for", locationid);
    Loc
        .findById(locationid)
        .select('reviews')
        .exec(
            function(err, location) {
                if (!err) {
                    doSetAverageRating(location);
                }
            });
};

var doAddReview = function(req, res, location) {
    if (!location) {
        sendJsonResponse(res, 404, {"message": "locationid not found"});
    } else {
        location.reviews.push({
            author: req.body.author,
            rating: req.body.rating,
            reviewText: req.body.reviewText
        });
        location.save(function(err, location) {
            var thisReview;
            if (err) {
                console.log(err);
                sendJsonResponse(res, 400, err);
            } else {
                updateAverageRating(location._id);
                thisReview = location.reviews[location.reviews.length - 1];
                sendJsonResponse(res, 201, thisReview);
            }
        });
    }
};

module.exports.reviewsCreate = function(req, res){
    var locationid = req.params.locationid;
    if (locationid) {
        Loc
            .findById(locationid)
            .select('reviews')
            .exec(
                function(err, location) {
                    if (err) {
                        sendJsonResponse(res, 400, err);
                    } else {
                        doAddReview(req, res, location);
                    }
                }
            );
    } else {
        sendJsonResponse(res, 404, {"message": "Not found, locationid required"});
    }
};

// GET a review by the id
module.exports.reviewsReadOne = function(req, res) {
    console.log("Getting single review");
    if (req.params && req.params.locationid && req.params.reviewid) { // Valida que contenga los 2 parámetros
        Loc
            .findById(req.params.locationid) // buscamos el documento con el locationid
            // Add Mongoose select method to model query, stating that we want to get name of location and its reviews
            .select('name reviews') // obtenemos sólo el name del documento y las reviews
            .exec(  // ejecutamos la búsqueda
                function(err, location) {   // función para la gestión de errores
                    //console.log(location);  
                    var response, review;
                    if (!location) {    // si no se encontró el documento, lanza mensaje de error
                        sendJsonResponse(res, 404, {"message": "locationid not found"});
                        return;
                    } else if (err) {   // si ocurre un error durante el proceso de busqueda, lanza el mensaje de error
                        sendJsonResponse(res, 400, err);
                        return;
                    }
                    if (location.reviews && location.reviews.length > 0) { // si hay reviews continua, de lo contrario manda mensaje de error
                        review = location.reviews.id(req.params.reviewid); // valida que coincida el parámetro con un id de los reviews
                        if (!review) {  // si no se encontró la review, lanza mensaje de error
                            sendJsonResponse(res, 404, {"message": "reviewid not found"});
                        } else { // si se encontró la review, envía la response sólo con el nombre del documento y la review, lanza mensaje satisfactorio
                            response = {
                                location: {
                                    name: location.name,
                                    id: req.params.locationid
                                },
                                review: review
                            };
                            sendJsonResponse(res, 200, response);
                        }
                    } else {
                        sendJsonResponse(res, 404, {"message": "No reviews found"});
                    }
                }
            );
    } else {
        sendJsonResponse(res, 404, {"message": "Not found, locationid and reviewid are both required"});
    }
  };

module.exports.reviewsUpdateOne = function(req, res){
    if (!req.params.locationid || !req.params.reviewid) {
        sendJsonResponse(res, 404, {"message": "Not found, locationid and reviewid are both required"});
        return;
    }
    Loc
        .findById(req.params.locationid)
        .select('reviews')
        .exec(
            function(err, location) {
                var thisReview;
                if (!location) {
                    sendJsonResponse(res, 404, {"message": "locationid not found"});
                    return;
                } else if (err) {
                    sendJsonResponse(res, 400, err);
                    return;
                }
                if (location.reviews && location.reviews.length > 0) {
                    thisReview = location.reviews.id(req.params.reviewid);
                    if (!thisReview) {
                        sendJsonResponse(res, 404, {"message": "reviewid not found"});
                    } else {
                        thisReview.author = req.body.author;
                        thisReview.rating = req.body.rating;
                        thisReview.reviewText = req.body.reviewText;
                        location.save(function(err, location) {
                            if (err) {
                                sendJsonResponse(res, 404, err);
                            } else {
                                updateAverageRating(location._id);
                                sendJsonResponse(res, 200, thisReview);
                            }
                        });
                    }
                } else {
                    sendJsonResponse(res, 404, {"message": "No review to update"});
                }
            }
        );
};

module.exports.reviewsDeleteOne = function(req, res){
    if (!req.params.locationid || !req.params.reviewid) {
        sendJsonResponse(res, 404, {"message": "Not found, locationid and reviewid are both required"});
        return;
    }
    Loc
        .findById(req.params.locationid)
        .select('reviews')
        .exec(
            function(err, location) {
                if (!location) {
                    sendJsonResponse(res, 404, {"message": "locationid not found"});
                    return;
                } else if (err) {
                    sendJsonResponse(res, 400, err);
                    return;
                }
                if (location.reviews && location.reviews.length > 0) {
                    if (!location.reviews.id(req.params.reviewid)) {
                        sendJsonResponse(res, 404, {"message": "reviewid not found"});
                    } else {
                        location.reviews.id(req.params.reviewid).remove();
                        location.save(function(err) {
                            if (err) {
                                sendJsonResponse(res, 404, err);
                            } else {
                                updateAverageRating(location._id);
                                sendJsonResponse(res, 204, null);
                            }
                        });
                    }
                } else {
                    sendJsonResponse(res, 404, {"message": "No review to delete"});
                }
            }
        );
};
