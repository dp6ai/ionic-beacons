angular.module('location')

    .controller('LocationsCtrl', function ($scope, LocationService, $state) {
        $scope.locations = LocationService.query();

        $scope.doRefresh = function () {
            $scope.locations = LocationService.query();
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.showLocation = function (location) {
            $state.go('location', {
                locationId: location.id
            });
        };
    })

    .controller('LocationCtrl', function ($scope, LocationService, $state, $stateParams) {
        $scope.location = LocationService.get({location: $stateParams.locationId});
    })


    .controller('MarkerRemoveCtrl', function($scope, $ionicLoading) {

        $scope.positions = [{
            lat: 43.07493,
            lng: -89.381388
        }];

        $scope.$on('mapInitialized', function(event, map) {
            $scope.map = map;
        });

        $scope.centerOnMe= function(){
            $scope.positions = [];


            $ionicLoading.show({
                template: 'Loading...'
            });


            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                $scope.positions.push({lat: pos.k,lng: pos.B});
                console.log(pos);
                $scope.map.setCenter(pos);
                $ionicLoading.hide();
            });

        };

    });

