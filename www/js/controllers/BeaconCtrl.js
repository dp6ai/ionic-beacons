app.controller('BeaconCtrl', function ($scope, LocationService, $state, $stateParams) {
  var location = LocationService.get({location: $stateParams.locationId});

  location.$promise.then(function (data) {
    $scope.beacon = (data.beacons.filter(function (el) {
      return el.id == $stateParams.beaconId
    }) )[0];
  });

  $scope.location = location;
})
