angular.module('location')

    .factory('LocationService', function ($resource) {
        return $resource('http://localhost:3000/locations/:location.json', {location: "@location"});
    })
