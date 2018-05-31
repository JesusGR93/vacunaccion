
angular.module('doctors').controller('doctorsListController', [
  '$scope', '$location', 'DoctorsFactory', '$mdDialog', 
  function($scope, $location, DoctorsFactory, $mdDialog) {

    // Variable to select the nav icon
    $scope.menuSelected = function(menu){
      if(menu.path == "/doctors")
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
      $scope.getDoctors();
    };

    // Load the doctors list without filtered
    $scope.getDoctors = function () {

      $scope.query.page = $scope.page;

      DoctorsFactory.get($scope.query,

        function(response) {
          if(response.success) {
            if (response.data.length === 0) {
              $scope.error = "No se encontraron coincidencias";
            }
            else {
              $scope.error = null;
            }
            $scope.doctorsList = response.data;
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
    $scope.deleteConfirm = function(ev, doctor) {
      var confirm = $mdDialog.confirm()
      .title('¿Está seguro que desea eliminar al médico seleccionado?')
      .textContent('Nombre: ' + doctor.user.first_name + ' ' + doctor.user.father_surname + ' ' + doctor.user.mother_surname)
      .ariaLabel('Lucky day')
      .targetEvent(ev)
      .ok('Eliminar')
      .cancel('Cancelar');

      $mdDialog.show(confirm).then(function() {
        $scope.doctorDelete(doctor);
      }, function() {
        return;
      });
    };

    // Service to delete the doctor object.
    $scope.doctorDelete = function (doctor, index) {
      DoctorsFactory.remove( {id: doctor._id},
        function(response) {
          if(response.success) {
            var index = $scope.doctorsList.indexOf(doctor);
            $scope.doctorsList.splice(index, 1);
          }
          else {
            $scope.error = "Registro no eliminado. " + response.message;
          }
        },
        function(errorResponse) {
          $scope.error = "Registro no eliminado. " + (errorResponse.data.message || errorResponse.data);
        }
      );
    };


  }
]);
