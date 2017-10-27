// Open IIFE (immediately invoked function expression)
(function () {
    
    angular
        .module('loc8rApp')
        .directive('ratingStars', ratingStars);
        
    function ratingStars() {
        return {
            restrict: 'EA',
            scope: {
                thisRating: '=rating'
            },
            templateUrl: '/common/directives/ratingStars/ratingStars.template.html'
        };
    }

// Close and invoke IIFE
})();