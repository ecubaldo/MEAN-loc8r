angular.module('loc8rApp', []);




var _isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

var formatDistance = function () {
    return function (distance) {
        var numDistance, unit;
        if (distance && _isNumeric(distance)) {
            if (distance > 1) {
                numDistance = parseFloat(distance).toFixed(1);
                unit = 'km';
            } else {
                numDistance = parseInt(distance * 1000,10);
                unit = 'm';
            }
            return numDistance + unit;
        } else {
            return "?";
        }
    };
};

var ratingStars = function () {
    return {
        scope: {
            thisRating : '=rating'
        },
        templateUrl: '/angular/rating-stars.html'
    };
};

// This service will check to see whether the browser supports geolocation and then attempt to get the coordinates
var geolocation = function () {
    // Define function called getPosition that accepts three callback functions for success, error, and not supported
    var getPosition = function (cbSuccess, cbError, cbNoGeo) {
        // If geolocation supported, call native method, passing through success and error callbacks
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
        } else {
            // If geolocation isn’t supported, invoke not supported callback
            cbNoGeo();
        }
    };
    return {
        // Return getPosition function so it can be invoked from controller
        getPosition : getPosition
    };
};

// Pass angular-service name into controller function as parameter
var locationListCtrl = function ($scope, loc8rData, geolocation) {
    // Set default message
    $scope.message = "Checking your location";

    // Function to run if geolocation is successful
    $scope.getData = function (position) {
        
        var lat = position.coords.latitude, lng = position.coords.longitude;

        $scope.message = "Searching for nearby places";
        loc8rData.locationByCoords(lat, lng)
            .success(function(data) {
                $scope.message = data.length > 0 ? "" : "No locations found";
                $scope.data = { locations: data };
            })
            .error(function (e) {
                $scope.message = "Sorry, something's gone wrong";
            });
    };

    // Function to run if geolocation is supported but not successful
    $scope.showError = function (error) {
        $scope.$apply(function() {
            $scope.message = error.message;
        });
    };

    // Function to run if geolocation isn’t supported by browser
    $scope.noGeo = function () {
        $scope.$apply(function() {
            $scope.message = "Geolocation not supported by this browser.";
        });
    };

    // Pass the function to our geolocation service
    geolocation.getPosition($scope.getData,$scope.showError,$scope.noGeo);

};

var loc8rData = function ($http) {
    var locationByCoords = function (lat, lng) {
        // return $http.get('/api/locations?lng=-0.96304865&lat=51.4510243&maxDistance=200');
        return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=2000');
    };
    return {
        locationByCoords : locationByCoords
    };
};

/*
var loc8rData = function () {
    return [{
        name: 'Burger Queen',
        address: '125 High Street, Reading, RG6 1PS',
        rating: 3,
        facilities: ['Hot drinks', 'Food', 'Premium wifi'],
        distance: '0.296456',
        _id: '5370a35f2536f6785f8dfb6a'
      },{
        name: 'Costy',
        address: '125 High Street, Reading, RG6 1PS',
        rating: 5,
        facilities: ['Hot drinks', 'Food', 'Alcoholic drinks'],
        distance: '0.7865456',
        _id: '5370a35f2536f6785f8dfb6a'
      },{
        name: 'Cafe Hero',
        address: '125 High Street, Reading, RG6 1PS',
        rating: 0,
        facilities: ['Hot drinks', 'Food', 'Premium wifi'],
        distance: '0.94561236',
        _id: '5370a35f2536f6785f8dfb6a'
      },{
        name: 'Starcups',
        address: '125 High Street, Reading, RG6 1PS',
        rating: 1,
        facilities: ['Hot drinks', 'Food', 'Cold drinks'],
        distance: '1.06548',
        _id: '5370a35f2536f6785f8dfb6a'
      },{
        name: 'Simon\'s cafe',
        address: '125 High Street, Reading, RG6 1PS',
        rating: 3,
        facilities: ['Hot drinks', 'Food', 'Premium wifi'],
        distance: '2.3654',
        _id: '5370a35f2536f6785f8dfb6a'
      },{
        name: 'Sally\'s pub',
        address: '125 High Street, Reading, RG6 1PS',
        rating: 5,
        facilities: ['Hot drinks', 'Food', 'Alcoholic drinks'],
        distance: '4.213654',
        _id: '5370a35f2536f6785f8dfb6a'
    }];
};
*/

angular
    .module('loc8rApp')
    .controller('locationListCtrl', locationListCtrl)
    .filter('formatDistance',formatDistance)
    .directive('ratingStars', ratingStars)
    .service('loc8rData', loc8rData)
    .service('geolocation', geolocation);