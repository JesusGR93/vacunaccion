
angular.module('tutors').config(['$routeProvider',

  function($routeProvider) {
    $routeProvider.
      when('/tutors', {
        templateUrl: 'tutors/views/tutors-list.client.view.html',
        controller: 'tutorsListController'
      }).
      when('/tutors/create', {
        templateUrl: 'tutors/views/tutors-create-update.client.view.html',
        controller: 'tutorsCreateController'
      }).
      when('/tutors/update/:id', {
        templateUrl: 'tutors/views/tutors-create-update.client.view.html',
        controller: 'tutorsUpdateController'
      });
  }

]);
