
angular.module('clinics').controller('clinicsListController', 
  ['$rootScope','$scope', '$location', '$routeParams', '$mdDialog', '$filter',
   'ClinicsFactory', 'StateFactory', 'DoctorsFactory', 'jwtAuth',
  function($rootScope, $scope, $location, $routeParams, $mdDialog, $filter, 
           ClinicsFactory, StateFactory, DoctorsFactory, jwtAuth) {

    // Variable to select the nav icon
    $scope.menuSelected = function(menu){
      if(menu.path == "/clinics") {
        menu.selected = true;
      }
    };

    // Pagination variables.
    $scope.pagination = {};
    $scope.maxSize = 10;
    $scope.page = 1;

    // query variables
    $scope.query = {
      'name': "",
      'page': 1
    };

    $scope.clearQuery = function () {
      $scope.query= {};
      $scope.getClinics();
    };

    // Load the clinics list without filtered
    $scope.getClinics = function () {


      if (!$rootScope.loggedUser) {
        $rootScope.loggedUser = {};
        $rootScope.loggedUser = jwtAuth.isAuthed();
      }

      if ($rootScope.loggedUser.role === 'doctor') {

          DoctorsFactory.getById( {id: $rootScope.loggedUser.id},
            function(response) {

              $rootScope.loggedDoctor = {};
              $rootScope.loggedDoctor = response.data;

              $scope.clinicsList = [];

              for (var i = 0; i < $rootScope.loggedDoctor.user.clinic.length; i++) {
                $scope.clinicsList.push($rootScope.loggedDoctor.user.clinic[i]);
              }

              $scope.clinicsList = $filter('filter')($scope.clinicsList, { name: $scope.query.name });

              $scope.itemsPerPage = 10;
              $scope.totalItems = $rootScope.loggedDoctor.user.clinic.length

            },
            function(errorResponse) {
              $scope.error = "Registro con id=" + $routeParams.id + " no recuperado. " + (errorResponse.data.message || errorResponse.data);
            }
          );

      } else {

        $scope.query.page = $scope.page;

        ClinicsFactory.get($scope.query,

          function(response) {
            if(response.success) {
              if (response.data.length === 0) {
                $scope.error = "No se encontraron coincidencias";
              }
              else {
                $scope.error = null;
              }
              $scope.clinicsList = response.data;
              $scope.itemsPerPage = response.pagination.itemsPerPage;
              $scope.totalItems = response.pagination.totalItems;
            }
            else {
              $scope.error = response.data.message;
            }
          },
          function(errorResponse) {
            $scope.error = errorResponse.data.message;
          }
        );

      }

    };

    // Delete confirmation modal.
    $scope.deleteConfirmation = function(ev, clinic) {

      if ($rootScope.loggedUser.role==='doctor') {
        $scope.error = "Usuario no autorizado para eliminar el registro.";
        return;
      }

      var confirm = $mdDialog.confirm()
      .title('¿Está seguro que desea eliminar la clínica seleccionada?')
      .textContent('Registro sanitario: ' + clinic.id)
      .ariaLabel('Lucky day')
      .targetEvent(ev)
      .ok('Eliminar')
      .cancel('Cancelar');

      $mdDialog.show(confirm).then(function() {
        $scope.clinicDelete(clinic);
      }, function() {
        return;
      });
    };

    // Service to delete the clinic object.
    $scope.clinicDelete = function (clinic) {

      ClinicsFactory.remove( {id: clinic._id},
        function(response) {
          if(response.success) {
            var index = $scope.clinicsList.indexOf(clinic);
            $scope.clinicsList.splice(index, 1);
          }
          else {
            console.log('Registro no eliminado');
            console.log(response);
          }
        },
        function(errorResponse) {
          console.log('Registro no eliminado');
          console.log(errorResponse);
        }
      );
    };

  }
]);