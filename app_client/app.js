// Open IIFE (immediately invoked function expression)
(function () {

    // Add ngRoute as module dependency
    angular.module('loc8rApp', ['ngRoute']);

    // Module config function to hold route definitions
    function config ($routeProvider) {
        
        $routeProvider
            .when('/', {
                templateUrl: 'home/home.view.html',
                // Add controller option to config for route, giving name of controller as string
                controller: 'homeCtrl',
                // Add controllerAs option to route definition, passing variable name to be used as string
                controllerAs: 'vm'
            })
            .otherwise({redirectTo: '/'});
            
    }

    // Add config to module, passing through $routeProvider as dependency
    angular
        .module('loc8rApp')
        .config(['$routeProvider', config]);

// Close and invoke IIFE
})();