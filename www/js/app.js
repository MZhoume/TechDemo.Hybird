// Ionic Starter App
/// <reference path="../scripts/reference.d.ts" />


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic'])

  .run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

  .config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('introduction', {
      url: '/introduction',
      templateUrl: 'introduction/introduction.html'
    })
  
    .state('home', {
      abstract: true,
      url: "/home",
      templateUrl: "home/home.html"
  })
  
    .state('home.monitor', {
      url: '/monitor',
      views: {
        'tabMonitor': {
          templateUrl: 'home/monitor.html'
        }
      }
    })
    
    .state('home.chart', {
      url: '/chart',
      views: {
        'tabChart': {
          templateUrl: 'home/chart.html'
        }
      }
    })
    
    .state('settings', {
      url: '/settings',
      templateUrl: 'settings/settings.html'
    });
    
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/introduction');
});
