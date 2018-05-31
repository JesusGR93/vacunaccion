
angular.module('admins').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/admins', {
      templateUrl: 'admins/views/admins-list.client.view.html',
      controller: 'AdminsListController'
    })
    .when('/admins/create', {
      templateUrl: 'admins/views/admins-create-update.client.view.html',
      controller: 'AdminsCreateController'
    })
    .when('/admins/update/:id', {
      templateUrl: 'admins/views/admins-create-update.client.view.html',
      controller: 'AdminsUpdateController'
    });
  }
]);
