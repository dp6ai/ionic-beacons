app.factory('LocationService', function ($resource) {
    return $resource('https://rocky-oasis-4598.herokuapp.com/locations/:location.json', {location: "@location"});
})
