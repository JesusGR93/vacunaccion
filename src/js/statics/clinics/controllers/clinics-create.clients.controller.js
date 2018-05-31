
angular.module('clinics').controller('clinicsCreateController', [
  '$rootScope', '$scope', '$location', '$routeParams', 'CatalogService',
  'ClinicsFactory', 'MunicipalityFactory', 'LocalityFactory',
  function($rootScope, $scope, $location, $routeParams, CatalogService,
    ClinicsFactory, MunicipalityFactory, LocalityFactory) {

    // Inicialize the variables.
    $scope.clinic = {};
    $scope.clinic.address = [];
    $scope.submitted = false;

    // To front texts 
    $scope.frontTexts = {
      button: 'Guardar',
      title1: 'Administración de Clínicas',
      title2: 'Alta de Clínica'
    }

    $scope.menuSelected = function(menu) {
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
            $scope.clinic.address[0].municipality_id = null;
            $scope.clinic.address[0].locality_id = null;
          }
        }
      );
    };

    $scope.searchLocalities = function(stateId, municipalityId) {
      LocalityFactory.get( {'stateId': stateId, 'municipalityId': municipalityId},
        function(response) {
          if(response.success) {
            $scope.localityList = response.data;
            $scope.clinic.address[0].locality_id = null;
          }
        }
      );
    };

    // Create clinic
    $scope.submit = function () {
      $scope.submitted = true;

      if ($scope.clinicForm.$pristine || $scope.clinicForm.$invalid) {
        $scope.error = 'El formulario no es válido o no ha sido modificado.';
   
        return;
      }

      var clinicsFactory = new ClinicsFactory($scope.clinic);

      clinicsFactory.$save(
        function(response) {

          if(response.success) {
            $location.path('clinics/');
          }
          else {
            $scope.error = response.message;
          }
        },
        function(errorResponse) {
          $scope.error = "Registro no guardado. " + (errorResponse.data.message || errorResponse.data);
        }
      );

    };

  }
]);
