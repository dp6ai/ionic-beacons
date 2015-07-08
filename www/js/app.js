// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var app = angular.module('location',
    [
        'ionic',
        'ngResource',
        'ngMap',
        'com.unarin.cordova.proximity.quickstart.monitoring',
        'com.unarin.cordova.proximity.quickstart.eventlog',
        'com.unarin.cordova.proximity.quickstart.ranging'
    ]);

    app.config(function ($stateProvider, $urlRouterProvider) {

        //window.console.debug('Configuring com.unarin.cordova.proximity.quickstart');

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'views/home.html',
                controller: 'MarkerRemoveCtrl'
            })
            .state('locations', {
                url: '/locations',
                templateUrl: 'views/locations.html',
                controller: 'LocationsCtrl'
            })
            .state('location', {
                url: '/location/:locationId',
                templateUrl: 'views/location.html',
                controller: 'LocationCtrl'
            })
            .state('ranging', {
                url: '/ranging',
                templateUrl: 'ranging/Ranging.html',
                controller: 'RangingCtrl'
            })
            .state('monitoring', {
                url: '/monitoring',
                templateUrl: 'monitoring/Monitoring.html',
                controller: 'MonitoringCtrl'
            })
            .state('eventlog', {
                url: '/eventlog',
                templateUrl: 'eventlog/EventLog.html',
                controller: 'EventLogCtrl'
            })
        ;

        $urlRouterProvider.otherwise('/home');
    })

    app.run(function ($ionicPlatform) {

        //console.debug('Running com.unarin.cordova.proximity.quickstart');

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    })




