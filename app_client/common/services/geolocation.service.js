// Open IIFE (immediately invoked function expression)
(function () {

    angular
        .module('loc8rApp')
        .service('geolocation', geolocation);
    
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


    

// Close and invoke IIFE
})();