
app.controller('LocationsCtrl', function ($scope, LocationService, $state) {
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

app.controller('LocationCtrl', function ($scope, LocationService, $state, $stateParams) {
        $scope.location = LocationService.get({location: $stateParams.locationId});
    })


app.controller('MarkerRemoveCtrl', function($scope, $ionicLoading, LocationService) {

    var all_locations = LocationService.query();

    $scope.$on('mapInitialized', function(event, map) {
        $scope.map = map;
    });


    $scope.positions = [{
        lat: 51.7550,
        lng: -0.3360
    }];


    $scope.getLocations = function() {
        all_locations.$promise.then(function (locations) {
            my_markers = [];

            angular.forEach(locations, function (location) {
                var marker = {};
                marker["lat"] = location.lat;
                marker['lng'] = location.lng;
                marker['title'] = location.name;

                my_markers.push(marker);
            });
            console.log(my_markers);
            $scope.markers = my_markers;
        });
    };

    //$scope.markers = [{lat: 51.5072, lng: -0.1275, title: "London"},
    //    {lat: 52.3931, lng: -0.7229, title: "Kettering"},
    //    {lat: 52.0400, lng: -0.7600, title: "Milton Keynes"},
    //    {lat: 51.7550, lng: -0.3360, title: "St. Albans"},
    //    {lat: 40.75, lng: -74.17},
    //    {lat: 40.76, lng: -74.16},
    //    {lat: 40.77, lng: -74.15},
    //    {lat: 40.78, lng: -74.14}];

    $scope.showMarkers = function() {
        for (var key in $scope.map.markers) {
            $scope.map.markers[key].setMap($scope.map);
        };
    };

    $scope.hideMarkers = function() {
        for (var key in $scope.map.markers) {
            $scope.map.markers[key].setMap(null);
        };
    };

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

            $scope.marker = new google.maps.Marker({
                position: new google.maps.LatLng(pos.k, pos.B),
                map: $scope.map,
                title: 'Holas!'
            }, function(err) {
                console.err(err);
            });
        });
    };
});
