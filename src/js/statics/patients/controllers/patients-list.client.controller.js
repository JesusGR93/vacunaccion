
angular.module('patients').controller('patientsListController', [
  '$rootScope', '$scope', '$location', '$mdDialog', 
  'PatientsFactory',
  function($rootScope, $scope, $location, $mdDialog,
    PatientsFactory) {

    // Variable to select the nav icon
    $scope.menuSelected = function(menu){
      if(menu.path == "/patients")
        menu.selected = true;
    };

    // Pagination variables.
    $scope.pagination = {};
    $scope.maxSize = 10;
    $scope.page = 1;

    // query variables
    $scope.query = {
      'first_name': null,
      'father_surname': null, 
      'mother_surname': null,
      'page': 1
    };

    $scope.clearQuery = function () {
      $scope.query= {};
      $scope.getPatients();
    };

    // Load the patient list without filtered
    $scope.getPatients = function () {

      $scope.query.page = $scope.page;

      PatientsFactory.get($scope.query,

        function(response) {
          if(response.success) {
            if (response.data.length === 0) {
              $scope.error = "No se encontraron coincidencias";
            }
            else {
              $scope.error = null;
            }
            $scope.patientsList = response.data;
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
    };

    // Delete confirmation modal.
    $scope.deleteConfirm = function(ev, patient) {

      if ($rootScope.loggedUser.role==='doctor') {
        $scope.error = "Usuario no autorizado para eliminar el registro.";
        return;
      }

      var confirm = $mdDialog.confirm()
      .title('¿Está seguro que desea eliminar el paciente seleccionado?')
      .textContent('Nombre: ' + patient.first_name + ' ' + patient.father_surname + ' ' + patient.mother_surname)
      .ariaLabel('Lucky day')
      .targetEvent(ev)
      .ok('Eliminar')
      .cancel('Cancelar');

      $mdDialog.show(confirm).then(function() {
        $scope.patientDelete(patient);
      }, function() {
        return;
      });
    };

    // Service to delete the patient object.
    $scope.patientDelete = function (patient, index) {
      PatientsFactory.remove( {id: patient._id},
        function(response) {
          if(response.success) {
            var index = $scope.patientsList.indexOf(patient);
            $scope.patientsList.splice(index, 1);
          }
          else {
            $scope.error = response.message;
          }
        },
        function(errorResponse) {
          $scope.error = "Registro no actualizado. " +(errorResponse.data.message || errorResponse.data);
        }
      );
    };

  }
]);
