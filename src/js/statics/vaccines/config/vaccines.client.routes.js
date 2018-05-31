// Configure the 'admins' module routes
angular.module('vaccines').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/vaccines', {
          templateUrl: 'vaccines/views/vaccines.client.view.html'
        }).
        when('/vaccines/create', {
          templateUrl: 'vaccines/views/vaccines-create.client.view.html'
        });
    }
]);
