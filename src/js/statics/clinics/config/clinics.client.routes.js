
angular.module('clinics').config(['$routeProvider',

  function($routeProvider) {
    $routeProvider.
      when('/clinics', {
        templateUrl: 'clinics/views/clinics-list.client.view.html',
        controller: 'clinicsListController'
      }).
      when('/clinics/create', {
        templateUrl: 'clinics/views/clinics-create-update.client.view.html',
        controller: 'clinicsCreateController'
      }).
      when('/clinics/update/:id', {
        templateUrl: 'clinics/views/clinics-create-update.client.view.html',
        controller: 'clinicsUpdateController'
      });
  }

]);
