var request = require('request');
var apiOptions = {
    server : "http://localhost:3000"
};
if (process.env.NODE_ENV === 'production') {
    //apiOptions.server = "https://getting-mean-loc8r.herokuapp.com";
    apiOptions.server = "https://afternoon-coast-14757.herokuapp.com/";
}


/* GET homelist page */
module.exports.homelist = function(req, res){
    renderHomepage(req, res);
};

var _formatDistance = function (distance) {
    var numDistance, unit;
    if (distance > 1) {
        numDistance = parseFloat(distance).toFixed(1);
        unit = 'km';
    } else {
        numDistance = parseInt(distance * 1000,10);
        unit = 'm';
    }
    return numDistance + unit;
};

var renderHomepage = function(req, res, responseBody){
    res.render('locations-list', {
        title: 'Loc8r - busca un lugar para trabajar con WIFI',
        pageHeader: {
            title: 'Loc8r',
            strapline: 'Busca lugares para trabajar con WIFI cerca de ti!'
        },
        sidebar: "¿Buscas wifi y un asiento? Loc8r le ayuda a encontrar lugares donde trabajar cuando está fuera de casa. Tal vez con café, pastel o una pinta? Deje que Loc8r le ayude a encontrar el lugar que está buscando."
    });
};




/* GET locationInfo page */
module.exports.locationInfo = function(req, res){
    getLocationInfo(req, res, function(req, res, responseData) {
        renderDetailPage(req, res, responseData);
    });
};

var _showError = function(req, res, status){
    var title, content;
    if (status === 404) {
        title = "404, page not found";
        content = "Oh, vaya. Parece que no enontramos esta página. Lo sentimos.";
    } else {
        title = status + ", algo ha salido mal";
        content = "Algo, en alguna parte, ha ido un poco mal.";
    }
    res.status(status);
    res.render('generic-text', {
        title : title,
        content : content
    });
};

var renderDetailPage = function(req, res, locDetail){
    res.render('location-info', {
        title: locDetail.name,
        pageHeader: {
            title: locDetail.name
        },
        sidebar: {
            context: ' está en Loc8r porque tiene WIFI y espacio para sentarse con su laptop y trabajar a gusto.',
            callToAction: 'Si te ha gustado - o no - por favor deja un comentario para ayudar a otras personas como tú.'
        },
        location: locDetail
    });
};


var renderReviewForm = function (req, res, locDetail) {
    res.render('location-review-form', {
        title: 'Review ' + locDetail.name + ' en Loc8r',
        pageHeader: { 
            title: 'Review ' + locDetail.name 
        },
        error: req.query.err,
        url: req.originalUrl
    });
};

/* GET addReview page */
module.exports.addReview = function(req, res){
    getLocationInfo(req, res, function(req, res, responseData) {
        renderReviewForm(req, res, responseData);
    });
};

/* POST doAddReview */
module.exports.doAddReview = function(req, res){
    var requestOptions, path, locationid, postdata;
    locationid = req.params.locationid;
    path = "/api/locations/" + locationid + '/reviews';
    postdata = {
        author: req.body.name,
        rating: parseInt(req.body.rating, 10),
        reviewText: req.body.review
    };
    requestOptions = {
        url : apiOptions.server + path,
        method : "POST",
        json : postdata
    };
    if (!postdata.author || !postdata.rating || !postdata.reviewText) {
        res.redirect('/location/' + locationid + '/review/new?err=val');
    } else {
        request(requestOptions,function(err, response, body) {
            if (response.statusCode === 201) {
                res.redirect('/location/' + locationid);
            } else if (response.statusCode === 400 && body.name && body.name === "ValidationError" ) {
                res.redirect('/location/' + locationid + '/review/new?err=val');
            } else {
                _showError(req, res, response.statusCode);
            }
        });
    }
};


var getLocationInfo = function (req, res, callback) {
    // Get locationid parameter from URL and append it to API path
    var path = "/api/locations/" + req.params.locationid;
    var requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : {}
    };
    request(requestOptions, function(err, response, body) {
        var data = body;
        if (response.statusCode === 200) {
            data.coords = {
                lng : body.coords[0],
                lat : body.coords[1]
            };
            callback(req, res, data);
        } else {
            _showError(req, res, response.statusCode);
        }
    });
};