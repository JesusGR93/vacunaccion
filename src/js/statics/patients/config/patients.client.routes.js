
angular.module('patients').config(['$routeProvider',

  function($routeProvider) {
    $routeProvider.
      when('/patients', {
        templateUrl: 'patients/views/patients-list.client.view.html',
        controller: 'patientsListController'
      }).
      when('/patients/create', {
        templateUrl: 'patients/views/patients-create-update.client.view.html',
        controller: 'patientsCreateController'
      }).
      when('/patients/update/:id', {
        templateUrl: 'patients/views/patients-create-update.client.view.html',
        controller: 'patientsUpdateController'
      });
  }

]);
