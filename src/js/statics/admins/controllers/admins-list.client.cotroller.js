
angular.module('admins').controller('AdminsListController', [
  '$scope', '$location', '$routeParams', 'AdminsFactory', '$mdDialog',
  function($scope, $location, $routeParams, AdminsFactory, $mdDialog) {

    // Variable to select icon of the nav.
    $scope.menuSelected = function(menu){
      if(menu.path == "/admins") {
        menu.selected = true;
      }
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
      $scope.getAdmins();
    };

    // Load the Admins list without filtered
    $scope.getAdmins = function () {

      $scope.query.page = $scope.page;

      AdminsFactory.get($scope.query,

        function(response) {
          if(response.success) {
            if (response.data.length === 0) {
              $scope.error = "No se encontraron coincidencias";
            }
            else {
              $scope.error = null;
            }
            $scope.adminsList = response.data;
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
    $scope.deleteConfirmation = function(ev, admin) {
      var confirm = $mdDialog.confirm()
      .title('¿Está seguro que desea eliminar el administrador seleccionado?')
      .textContent(admin.user.first_name + ' ' + admin.user.father_surname + ' ' + admin.user.mother_surname)
      .ariaLabel('Lucky day')
      .targetEvent(ev)
      .ok('Eliminar')
      .cancel('Cancelar');

      $mdDialog.show(confirm).then(function() {
        $scope.adminDelete(admin);
      }, function() {
        return;
      });
    };

    // Service to delete the admin object.
    $scope.adminDelete = function (admin) {
      
      AdminsFactory.remove( {id: admin._id},
        function(response) {
          if(response.success) {
            var index = $scope.adminsList.indexOf(admin);
            $scope.adminsList.splice(index, 1);
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