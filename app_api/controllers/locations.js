var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

var theEarth = (function(){
    var earthRadius = 6371; // km, miles is 3959
    // Create function to convert radians to distance
    var getDistanceFromRads = function(rads) {
        return parseFloat(rads * earthRadius);
    };
    // Create function to convert distance to radians
    var getRadsFromDistance = function(distance) {
        return parseFloat(distance / earthRadius);
    };
    // Expose these two functions
    return {
        getDistanceFromRads : getDistanceFromRads,
        getRadsFromDistance : getRadsFromDistance
    };
})();

// GET list of locations
module.exports.locationsListByDistance = function(req, res){
    // Get coordinates from query string and convert from strings to numbers
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var maxDistance = parseFloat(req.query.maxDistance);
    // Create geoJSON point
    var point = {
        type: "Point",
        coordinates: [lng, lat]
    };
    // Create geoOptions
    var geoOptions = {
        spherical: true,
        maxDistance: theEarth.getRadsFromDistance(maxDistance), //Create options object, including setting maximum distance to 20 km
        num: 10
    };
    // Check lng and lat query parameters exist in right format; return a 404 error and message if not
    if ((!lng && lng!==0) || (!lat && lat!==0) || ! maxDistance) {
        sendJsonResponse(res, 404, {"message": "lng and lat query parameters are required"});
        return;
    }

    Loc.geoNear(point, geoOptions, function (err, results, stats) {
        var locations;
        //console.log('Geo Results', results);
        //console.log('Geo stats', stats);
        // If geoNear query returns error, send this as response with 404 status
        if (err) {
            console.log('geoNear error:', err);
            sendJsonResponse(res, 404, err);
        }else{
            locations = buildLocationList(req, res, results, stats);
            sendJsonResponse(res, 200, locations);
        }
    });
};

// Construimos la lista de locaciones con los datos necesarios
var buildLocationList = function(req, res, results, stats) {
    var locations = [];
    results.forEach(function(doc) {
        locations.push({
            distance: theEarth.getDistanceFromRads(doc.dis),
            name: doc.obj.name,
            address: doc.obj.address,
            rating: doc.obj.rating,
            facilities: doc.obj.facilities,
            _id: doc.obj._id
        });
    });
    return locations;
};


module.exports.locationsCreate = function(req, res){
    // Apply create method to model
    Loc.create({
        name: req.body.name,
        address: req.body.address,
        // Create array of facilities by splitting a comma-separated list
        facilities: req.body.facilities.split(","),
        // Parse coordinates from strings to numbers
        coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
        openingTimes: [{
            days: req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1,
        }, {
            days: req.body.days2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2,
        }]
        // Supply callback function, containing appropriate responses for success and failure
        }, function(err, location) {
            if (err) {
                sendJsonResponse(res, 400, err);
            } else {
                sendJsonResponse(res, 201, location);
            }
        });
};

// GET a location by the id
module.exports.locationsReadOne = function(req, res){
    console.log('Finding location details', req.params);
    if (req.params && req.params.locationid) {
        Loc
            .findById(req.params.locationid)
            .exec(function(err, location) {
                if (!location) {
                    sendJsonResponse(res, 404, {"message": "locationid not found"});
                    return;
                } else if (err) {
                    console.log(err);
                    sendJsonResponse(res, 404, err);
                    return;
                }
                //console.log(location);
                sendJsonResponse(res, 200, location);
            });
    }else {
        console.log('No locationid specified');
        sendJsonResponse(res, 404, {"message": "No locationid in request"});
    }
};

module.exports.locationsUpdateOne = function(req, res){
    if (!req.params.locationid) {
        sendJsonResponse(res, 404, {"message": "Not found, locationid is required"});
        return;
    }
    Loc
        .findById(req.params.locationid)
        .select('-reviews -rating')
        .exec(
            function(err, location) {
                if (!location) {
                    sendJsonResponse(res, 404, {"message": "locationid not found"});
                    return;
                } else if (err) {
                    sendJsonResponse(res, 400, err);
                    return;
                }
                location.name = req.body.name;
                location.address = req.body.address;
                location.facilities = req.body.facilities.split(",");
                location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
                location.openingTimes = [{
                    days: req.body.days1,
                    opening: req.body.opening1,
                    closing: req.body.closing1,
                    closed: req.body.closed1,
                }, {
                    days: req.body.days2,
                    opening: req.body.opening2,
                    closing: req.body.closing2,
                    closed: req.body.closed2,
                }];
                location.save(function(err, location) {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else {
                        sendJsonResponse(res, 200, location);
                    }
                });
            }
        );
};

module.exports.locationsDeleteOne = function(req, res){
    var locationid = req.params.locationid;
    if (locationid) {
        Loc
            .findByIdAndRemove(locationid)
            .exec(
                function(err, location) {
                    if (err) {
                        console.log(err);
                        sendJsonResponse(res, 404, err);
                        return;
                    }
                    console.log("Location id " + locationid + " deleted");
                    sendJsonResponse(res, 204, null);
                }
            );
    } else {
        sendJsonResponse(res, 404, {"message": "No locationid"});
    }
};

