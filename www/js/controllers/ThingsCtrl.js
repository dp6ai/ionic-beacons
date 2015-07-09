app.controller('ThingsCtrl', ['$log', '$rootScope', '$scope', '$window', '$localForage', function ($log, $rootScope, $scope, $window, $localForage) {

    // Nearest ranged beacon.
    var mNearestBeacon = null;

    //Maintain a list of near beacons
    var mNearBeacons = [];

    // Timer that displays nearby beacons.
    var mNearestBeaconDisplayTimer = null;
    var mNearBeaconDisplayTimer = null;

    // Background flag.
    var mAppInBackground = false;

    // Background notification id counter.
    var mNotificationId = 0;

    // Here monitored regions are defined.
    // TODO: Update with uuid/major/minor for your beacons.
    // You can add as many beacons as you want to use.
    var mRegions =
        [
            {
                id: 'region1',
                uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
                major: 1000,
                minor: 1001
            },
            {
                id: 'region2',
                uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
                major: 1000,
                minor: 1100
            },
            {
                id: 'region3',
                uuid: '74278BDA-B644-4520-8F0C-720EAF059935',
                major: 12345,
                minor: 34567
            }
        ];


    // Region data is defined here. Mapping used is from
    // region id to a string. You can adapt this to your
    // own needs, and add other data to be displayed.
    // TODO: Update with major/minor for your own beacons.
    var mRegionData =
    {
        'region1': 'Region One',
        'region2': 'Region Two',
        'region2': 'Region Three'

    };

    $scope.startRanging = function () {
        startMonitoringAndRanging();
        startNearestBeaconDisplayTimer();
    };

    startNearestBeaconDisplayTimer = function () {
        mNearestBeaconDisplayTimer = setInterval(displayNearestBeacon, 3000);
        mNearBeaconDisplayTimer = setInterval(displayNearBeacons, 3000);
    }

    startMonitoringAndRanging = function () {

        onDidDetermineStateForRegion = function (result) {
            saveRegionEvent(result.state, result.region.identifier);
            displayRecentRegionEvent();
        }

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
        delegate.didDetermineStateForRegion = onDidDetermineStateForRegion;
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
    //
    //updateNearBeacons = function (beacons) {
    //    mNearBeacons = beacons;
    //}

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
            var element = (
                '<div class="item item-button-right">'
                + 'major: ' + beacon.major + '<br />'
                + 'minor: ' + beacon.minor + '<br />'
                + 'UUID: ' + beacon.uuid + '<br />'
                //+ '<button class="button button-positive">'
                //+ '<i class="icon ion-ios-telephone"></i>'
                //+ '</button>'
                + '</div>'
            );

            elements = elements+element;
        });

        thingsElement.empty();
        //add elements to DOM
        thingsElement.append(elements);
    }


    displayNearestBeacon = function () {
        console.log("somethings happening");
        var beaconElement = angular.element( document.querySelector( '#beacon' ) );

        if (!mNearestBeacon) {
            var element = (
                '<li>'
                + '<strong>No Beacons</strong><br />'
                + '</li>'
            );
        } else {
            var element = (
                '<li>'
                + '<strong>Nearest Beacon</strong><br />'
                + 'UUID: ' + mNearestBeacon.uuid + '<br />'
                + 'Major: ' + mNearestBeacon.major + '<br />'
                + 'Minor: ' + mNearestBeacon.minor + '<br />'
                + 'Proximity: ' + mNearestBeacon.proximity + '<br />'
                + 'Distance: ' + mNearestBeacon.accuracy + '<br />'
                + 'RSSI: ' + mNearestBeacon.rssi + '<br />'
                + '</li>'
            );
        }

        // Clear element.
        beaconElement.empty();

        beaconElement.append(element);
    }

}]);
////------------------------------------------//
//var beaconElement = angular.element(document.querySelector('#beacon'));
//var element = (
//    '<li><h1>BOOOOOM</h1></li>'
//);
//// Clear element.
//beaconElement.empty();
//beaconElement.append(element);
////------------------------------------------//

