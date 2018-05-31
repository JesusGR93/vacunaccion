
angular.module('doctors').service('DoctorRoleService', [
  '$rootScope', 'jwtAuth', 'DoctorsFactory',
  function($rootScope, jwtAuth, DoctorsFactory) {

    this.load = function() {

      if (!$rootScope.loggedUser) {
        $rootScope.loggedUser = {};
        $rootScope.loggedUser = jwtAuth.isAuthed();
      }

      if ($rootScope.loggedUser.role === 'doctor') {

          DoctorsFactory.getById( {id: $rootScope.loggedUser.id},
            function(response) {

              $rootScope.loggedDoctor = {};
              $rootScope.loggedDoctor = response.data;

            },
            function(errorResponse) {
              $scope.error = "Registro con id=" + $routeParams.id + " no recuperado. " + (errorResponse.data.message || errorResponse.data);
            }
          );

      }

    }

  }
]);