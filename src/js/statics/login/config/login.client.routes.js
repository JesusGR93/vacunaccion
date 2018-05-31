// Configure the 'admins' module routes
angular.module('login').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/login', {
      templateUrl: 'login/views/login.client.view.html'
    }).
    when('/reset', {
      templateUrl: 'login/views/reset.client.view.html'
    }).
    when('/activate', {
      templateUrl: 'login/views/activate.client.view.html'
    }).
    when('/reset/:url_token', {
      templateUrl: 'login/views/reset.client.view.html'
    });
  }
]);
