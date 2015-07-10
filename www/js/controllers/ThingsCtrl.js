app.controller('ThingsCtrl', [
    '$log',
    '$rootScope',
    '$scope',
    '$window',
    '$localForage',
    '$state',
    '$stateParams',
    'LocationService',
    function (
        $log,
        $rootScope,
        $scope,
        $window,
        $localForage,
        $state,
        $stateParams,
        LocationService
    ) {

    var mTest = null;

    // Nearest ranged beacon.
    var mNearestBeacon = null;

    //Maintain a list of near beacons
    var mNearBeacons = [];

    // Timer that displays nearby beacons.
    //var mNearestBeaconDisplayTimer = null;
    var mNearBeaconDisplayTimer = null;

    $scope.startRanging = function () {
        setLocation();
        setBeaconHash().then(function (data) {
            mTest = data;
            startMonitoringAndRanging(data);
            startNearestBeaconDisplayTimer();
        });
    };

    setLocation = function () {
        $scope.location = LocationService.get({location: $stateParams.locationId});
    }

    setBeaconHash = function () {
        return $scope.location.$promise.then(function (objects) {
            var my_beacons = [];
            angular.forEach(objects.beacons, function (beacon) {

                var beac = {};
                beac["id"] = beacon.id.toString();;
                beac["location_id"] = beacon.location_id.toString();;
                beac["name"] = beacon.name;
                beac["uuid"] = beacon.uuid;
                beac['major'] = beacon.major;
                beac['minor'] = beacon.minor;
                beac['description'] = beacon.description;
                beac['image'] = beacon.image;
                my_beacons.push(beac);
            });
            return my_beacons;
        });
    }

    startNearestBeaconDisplayTimer = function () {
        mNearBeaconDisplayTimer = setInterval(displayNearBeacons, 3000);
    }

    startMonitoringAndRanging = function (mRegions) {
        onDidRangeBeaconsInRegion = function (result) {
            updateNearestBeacon(result.beacons);
        }

        onError = function (errorMessage) {
            $log.debug('Monitoring beacons did fail: ' + errorMessage);
        }

        // Request permission from user to access location info.
        cordova.plugins.locationManager.requestAlwaysAuthorization();

        // Create delegate object that holds beacon callback functions.
        var delegate = new cordova.plugins.locationManager.Delegate();
        cordova.plugins.locationManager.setDelegate(delegate);

        // Set delegate functions.
        delegate.didRangeBeaconsInRegion = onDidRangeBeaconsInRegion;

        // Start monitoring and ranging beacons.
        startMonitoringAndRangingRegions(mRegions, onError);
    }

    startMonitoringAndRangingRegions = function (regions, errorCallback) {
        // Start monitoring and ranging regions.
        for (var i in regions) {
            startMonitoringAndRangingRegion(regions[i], errorCallback);
        }
    }

    startMonitoringAndRangingRegion = function (region, errorCallback) {
        // Create a region object.
        var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
            region.id,
            region.uuid,
            region.major,
            region.minor);

        // Start ranging.
        cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
            .fail(errorCallback)
            .done();

        // Start monitoring.
        cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
            .fail(errorCallback)
            .done();
    }

    getBeaconId = function (beacon)
    {
        return beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
    }

    isSameBeacon = function (beacon1, beacon2) {
        return getBeaconId(beacon1) == getBeaconId(beacon2);
    }

    isNearerThan = function (beacon1, beacon2) {
        return beacon1.accuracy > 0
            && beacon2.accuracy > 0
            && beacon1.accuracy < beacon2.accuracy;
    }

    updateNearestBeacon = function (beacons) {
        for (var i = 0; i < beacons.length; ++i) {
            var beacon = beacons[i];
            if (!mNearestBeacon) {
                mNearestBeacon = beacon;
            }
            else {
                if (isSameBeacon(beacon, mNearestBeacon) ||
                    isNearerThan(beacon, mNearestBeacon)) {
                    mNearestBeacon = beacon;
                }
            }
        }
    }

    getBeaconId = function (beacon)
    {
        return beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
    }

    displayNearBeacons = function () {

        var thingsElement = angular.element( document.querySelector( '#things' ) );
        var elements = "";

        //remove old position of mNearestBeacon in mNearBeacons
        mNearBeacons = mNearBeacons.filter(function( obj ) {
            return getBeaconId(obj) !== getBeaconId(mNearestBeacon);
        });

        //add mNearestBeacon to head of mNearBeacons
        mNearBeacons.unshift(mNearestBeacon);

        //create elements html
        angular.forEach(mNearBeacons, function (beacon) {
            //slow this down?
            current_beacon = (mTest.filter(function (el) {
                return el.uuid == beacon.uuid &&
                    el.major == beacon.major &&
                    el.minor == beacon.minor

            }) )[0];

            var url = "/location/" + current_beacon.location_id + "/beacon/" + current_beacon.id

            var element = (
                '<a class="item item-thumbnail-right" href="#' + url + '" >' +
                '<img src="' + current_beacon.image + '">' +
                '<h2>' + current_beacon.name + '</h2>' +
                '<p>' + current_beacon.description + '</p>' +
                '</a>'
            );

            elements = elements+element;
        });

        thingsElement.empty();
        //add elements to DOM
        thingsElement.append(elements);
    }

}]);
