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
