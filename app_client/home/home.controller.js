// Open IIFE (immediately invoked function expression)
(function () {
    console.log("$$$$$$");
    
    angular
        .module('loc8rApp')
        .controller('homeCtrl', homeCtrl);

    homeCtrl.$inject = ['$scope', 'loc8rData', 'geolocation'];
    // Pass names of services into controller
    function homeCtrl ($scope, loc8rData, geolocation) {
        console.log("######");
        
        var vm = this;
        vm.pageHeader = {
            title: 'Loc8r',
            strapline: 'Find places to work with wifi near you!'
        };
        vm.sidebar = {
            content: "Looking for wifi and a seat etc etc"
        };
        
        // Set default message
        vm.message = "Checking your location";

        // Function to run if geolocation is successful
        vm.getData = function (position) {
            
            var lat = position.coords.latitude,
                lng = position.coords.longitude;

            vm.message = "Searching for nearby places";
            loc8rData.locationByCoords(lat, lng)
                .success(function (data) {
                    vm.message = data.length > 0 ? "" : "No locations found nearby";
                    vm.data = { locations: data };
                    console.log('*****');
                    console.log(vm.data);
                })
                .error(function (e) {
                    vm.message = "Sorry, something's gone wrong";
                });
        };

        // Function to run if geolocation is supported but not successful
        vm.showError = function (error) {
            $scope.$apply(function () {
                vm.message = error.message;
            });
        };

        // Function to run if geolocation isn’t supported by browser
        vm.noGeo = function () {
            $scope.$apply(function () {
                vm.message = "Geolocation is not supported by this browser.";
            });
        };

        // Pass the function to our geolocation service
        geolocation.getPosition(vm.getData, vm.showError, vm.noGeo);
    }

// Close and invoke IIFE
})();