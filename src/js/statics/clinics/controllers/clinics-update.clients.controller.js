
angular.module('clinics').controller('clinicsUpdateController', [
  '$rootScope', '$scope', '$location', '$routeParams', 'CatalogService',
  'ClinicsFactory', 'MunicipalityFactory', 'LocalityFactory',
  function($rootScope, $scope, $location, $routeParams, CatalogService,
    ClinicsFactory, MunicipalityFactory, LocalityFactory) {

    // Inicialize the variables.
    $scope.clinic = {};
    $scope.clinic.address = {};
    
    $scope.submitted = false;
    $scope.firstTime = true;

    // To front texts 
    $scope.frontTexts = {
      button: 'Actualizar',
      title1: 'Administración de Clínicas',
      title2: 'Actualizar de Clínica'
    }

    $scope.menuSelected = function(menu){
      if(menu.path == "/clinics") {
        menu.selected = true;
      }
    };

    // Load catalogs
    if (!$rootScope.catalog) {
      CatalogService.load();
    }

    $scope.searchMunicipalities = function(stateId) {
      MunicipalityFactory.get( {'id': stateId},
        function(response) {
          if(response.success) {
            $scope.municipalityList = response.data;
            if (!$scope.firstTime) {
              $scope.clinic.address[0].municipality_id = null;
              $scope.clinic.address[0].locality_id = null;
            }
          }
        }
      );
    };

    $scope.searchLocalities = function(stateId, municipalityId) {
      LocalityFactory.get( {'stateId': stateId, 'municipalityId': municipalityId},
        function(response) {
          if(response.success) {
            $scope.localityList = response.data;
            if (!$scope.firstTime) {
              $scope.clinic.address[0].locality_id = null;
            }
            $scope.firstTime = false;
          }
        }
      );
    };

    // Get data clinic
    ClinicsFactory.getById( {id: $routeParams.id},
      function(response) {

        if(response.success) {

          $scope.clinic = response.data;

          $scope.clinic.address[0].state_id = $scope.clinic.address[0].state_id._id;
          $scope.clinic.address[0].municipality_id = $scope.clinic.address[0].municipality_id.id;
          $scope.clinic.address[0].locality_id = $scope.clinic.address[0].locality_id.id;

          $scope.searchMunicipalities($scope.clinic.address[0].state_id);
          $scope.searchLocalities($scope.clinic.address[0].state_id, $scope.clinic.address[0].municipality_id);
        }
        else {
          $scope.error = response.message;
        }
      },
      function(errorResponse) {
        $scope.error = errorResponsedata.message;
      }
    );

    // Create clinic
    $scope.submit = function () {

      if ($rootScope.loggedUser.role==='doctor') {
        $scope.error = "Usuario no autorizado para actualizar el registro.";
        return;
      }

      $scope.submitted = true;

      if ($scope.clinicForm.$invalid) {
        $scope.error = 'El formulario no es válido.';
        return;
      }
      // delete $scope.clinic._id;
      var clinicFactory = new ClinicsFactory($scope.clinic);

      clinicFactory.$update( {id: $routeParams.id},
        function(response) {
          if(response.success) {
            $location.path('clinics/');
          }
          else {
            $scope.error = response.message;
          }
        },
        function(errorResponse) {
          $scope.error = "Registro no actualizado. " + (errorResponse.data.message || errorResponse.data);
        }
      );

    };

  }
]);
