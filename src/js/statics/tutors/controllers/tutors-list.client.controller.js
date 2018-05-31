
angular.module('tutors').controller('tutorsListController', [
  '$rootScope', '$scope', '$location', 'TutorsFactory', '$mdDialog', '$filter', 
  'DoctorsFactory', 'jwtAuth',
  function($rootScope, $scope, $location, TutorsFactory, $mdDialog, $filter,
   DoctorsFactory, jwtAuth) {

    // Load the list of tutors filtered by name.
    $scope.menuSelected = function(menu){
      if(menu.path == "/tutors")
        menu.selected = true;
    };

    // Pagination variables.
    $scope.pagination = {};
    $scope.maxSize = 10;
    $scope.page = 1;

    // query variables
    $scope.query = {
      'first_name': "",
      'father_surname': "", 
      'mother_surname': "",
      'page': 1
    };

    $scope.clearQuery = function () {
      $scope.query= {};
      $scope.getTutors();
    };
    
    // Load the tutor list without filtered
    $scope.getTutors = function () {


      if (!$rootScope.loggedUser) {
        $rootScope.loggedUser = {};
        $rootScope.loggedUser = jwtAuth.isAuthed();
      }

      if ($rootScope.loggedUser.role === 'doctor') {

          DoctorsFactory.getById( {id: $rootScope.loggedUser.id},
            function(response) {

              $rootScope.loggedDoctor = {};
              $rootScope.loggedDoctor = response.data;

              $scope.tutorsList = [];

              var totalItems = 0;

              for (var i = 0; i < $rootScope.loggedDoctor.user.patient.length; i++) {
                for (var j = 0; j < $rootScope.loggedDoctor.user.patient[i].tutor.length; j++) {
                  $scope.tutorsList.push($rootScope.loggedDoctor.user.patient[i].tutor[j].person);
                  totalItems++;
                }
              }

              var filter = { 
                "user": { 
                  "first_name": $scope.query.first_name, 
                  "father_surname": $scope.query.father_surname, 
                  "mother_surname": $scope.query.mother_surname 
                }
              };
              
              $scope.tutorsList = $filter('filter')($scope.tutorsList, filter);

              $scope.itemsPerPage = 10;
              $scope.totalItems = totalItems;

            },
            function(errorResponse) {
              $scope.error = "Registro con id=" + $routeParams.id + " no recuperado. " + (errorResponse.data.message || errorResponse.data);
            }
          );

      } else {

        $scope.query.page = $scope.page;

        TutorsFactory.get($scope.query,

          function(response) {
            if(response.success) {
              if (response.data.length === 0) {
                $scope.error = "No se encontraron coincidencias";
              }
              else {
                $scope.error = null;
              }
              $scope.tutorsList = response.data;
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
    $scope.deleteConfirm = function(ev, tutor) {

      if ($rootScope.loggedUser.role==='doctor') {
        $scope.error = "Usuario no autorizado para eliminar el registro.";
        return;
      }

      var confirm = $mdDialog.confirm()
      .title('¿Está seguro que desea eliminar el tutor seleccionado?')
      .textContent('Nombre: ' + tutor.user.first_name + ' ' + tutor.user.father_surname + ' ' + tutor.user.mother_surname)
      .ariaLabel('Lucky day')
      .targetEvent(ev)
      .ok('Eliminar')
      .cancel('Cancelar');

      $mdDialog.show(confirm).then(function() {
        $scope.tutorDelete(tutor);
      }, function() {
        return;
      });
    };

    // Service to delete the tutor object.
    $scope.tutorDelete = function (tutor, index) {
      TutorsFactory.remove( {id: tutor._id},
        function(response) {
          if(response.success) {
            var index = $scope.tutorsList.indexOf(tutor);
            $scope.tutorsList.splice(index, 1);
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
