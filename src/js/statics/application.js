// Invoke 'strict' JavaScript mode
'use strict';

// Set the main appliccation name
var mainApplicationModuleName = 'mean';

// Create the main application
var mainApplicationModule = angular.module(mainApplicationModuleName,
    [
      'ngResource', 'ngRoute', 'ngMaterial','ngFileUpload', 'ui.bootstrap',
      'configuration',
      'base64',
      'tools',
      'login',
      'asideMenu','index', 'catalogs',
      'admins', 'doctors', 'tutors', 'patients', 'clinics', 'vaccines'
    ]);

// Configure the hashbang URLs using the $locationProvider services
mainApplicationModule.config(['$locationProvider', '$mdThemingProvider', '$mdDateLocaleProvider',
  function($locationProvider, $mdThemingProvider, $mdDateLocaleProvider) {
      
    $locationProvider.hashPrefix('!');

    $mdThemingProvider.theme('default')
      .primaryPalette('green');

    $mdDateLocaleProvider.formatDate = function(date) {
      return date ? moment(date).format('DD-MM-YYYY') : '';
    };
    
    $mdDateLocaleProvider.parseDate = function(dateString) {
      var m = moment(dateString, 'DD-MM-YYYY', true);
      return m.isValid() ? m.toDate() : new Date(NaN);
    };

  }
]);

if(window.location.hash === '#_=_') window.location.hash = '#!';

// Manually bootstrap the AngularJS application
angular.element(document).ready(function() {
    angular.bootstrap(document, [mainApplicationModuleName]);
});