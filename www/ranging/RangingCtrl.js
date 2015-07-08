app.controller('RangingCtrl', ['$log', '$rootScope', '$scope', '$window', '$localForage', function ($log, $rootScope, $scope, $window, $localForage) {

    // History of enter/exit events.
    var mRegionEvents = [];

    // Nearest ranged beacon.
    var mNearestBeacon = null;

    // Timer that displays nearby beacons.
    var mNearestBeaconDisplayTimer = null;

    // Background flag.
    var mAppInBackground = false;

    // Background notification id counter.
    var mNotificationId = 0;

    // Mapping of region event state names.
    // These are used in the event display string.
    var mRegionStateNames =
    {
        'CLRegionStateInside': 'Enter',
        'CLRegionStateOutside': 'Exit'
    };

    // Here monitored regions are defined.
    // TODO: Update with uuid/major/minor for your beacons.
    // You can add as many beacons as you want to use.
    var mRegions =
        [
            {
                id: 'region1',
                uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0'
                //major: 5662,
                //minor: 53377
            },
            {
                id: 'region2',
                uuid: '5A4BCFCE-174E-4BAC-A814-092E77F6B7E5',
                major: 60378,
                minor: 22122
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
        displayRegionEvents();
    };

    //$log.debug('ksdjfhaksdfjlsafjldskfj');

    //
    //$scope.pauseRanging = function () {
    //    mAppInBackground = true;
    //    stopNearestBeaconDisplayTimer();
    //};
    //
    //$scope.resumeRanging = function () {
    //    mAppInBackground = false;
    //    startNearestBeaconDisplayTimer();
    //    displayRegionEvents();
    //};
    //
    startNearestBeaconDisplayTimer = function () {
        mNearestBeaconDisplayTimer = setInterval(displayNearestBeacon, 1000);
    }

    //stopNearestBeaconDisplayTimer = function () {
    //    clearInterval(mNearestBeaconDisplayTimer);
    //    mNearestBeaconDisplayTimer = null;
    //}
    //
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

    $scope.testRender = function () {
//TODO
        var beaconElement = angular.element(document.querySelector('#beacon'));

        var element = (
            '<li><h1>BOOOOOM</h1></li>'
        );

        // Clear element.
        beaconElement.empty();

        beaconElement.append(element);
    }

    displayNearestBeacon = function () {

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

    displayRegionEvents = function ()
    {
        var eventsElement = angular.element(document.querySelector('#events'));

        // Clear list.
        eventsElement.empty();

        // Update list.
        for (var i = mRegionEvents.length - 1; i >= 0; --i)
        {
            var event = mRegionEvents[i];
            var title = getEventDisplayString(event);
            var element = (
                '<li>'
                + '<strong>' + title + '</strong>'
                + '</li>'
            );
            eventsElement.append(element);
        }

        // If the list is empty display a help text.
        if (mRegionEvents.length <= 0)
        {
            var element = (
                '<li>'
                + '<strong>'
                +	'Waiting for region events, please move into or out of a beacon region.'
                + '</strong>'
                + '</li>'
            );
            eventsElement.append(element);
        }
    }

    getEventDisplayString = function (event) {
        return event.time + ': '
            + mRegionStateNames[event.type] + ' '
            + mRegionData[event.regionId];
    }

    saveRegionEvent = function (eventType, regionId) {
        // Save event.
        mRegionEvents.push(
            {
                type: eventType,
                time: getTimeNow(),
                regionId: regionId
            });

        // Truncate if more than ten entries.
        if (mRegionEvents.length > 10) {
            mRegionEvents.shift();
        }
    }


    displayRecentRegionEvent = function () {
        if (mAppInBackground) {
            // Set notification title.
            var event = mRegionEvents[mRegionEvents.length - 1];
            if (!event) {
                return;
            }
            var title = getEventDisplayString(event);

            // Create notification.
            cordova.plugins.notification.local.schedule({
                id: ++mNotificationId,
                title: title
            });
        }
        else {
            displayRegionEvents();
        }
    }

    getTimeNow = function () {
        function pad(n) {
            return (n < 10) ? '0' + n : n;
        }

        function format(h, m, s) {
            return pad(h) + ':' + pad(m) + ':' + pad(s);
        }

        var d = new Date();
        return format(d.getHours(), d.getMinutes(), d.getSeconds());
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

