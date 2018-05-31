
angular.module('doctors').config(['$routeProvider',

  function($routeProvider) {
    $routeProvider.
      when('/doctors', {
        templateUrl: 'doctors/views/doctors-list.client.view.html',
        controller: 'doctorsListController'
      }).
      when('/doctors/create', {
        templateUrl: 'doctors/views/doctors-create-update.client.view.html',
        controller: 'doctorsCreateController'
      }).
      when('/doctors/update/:id', {
        templateUrl: 'doctors/views/doctors-create-update.client.view.html',
        controller: 'doctorsUpdateController'
      });
  }

]);