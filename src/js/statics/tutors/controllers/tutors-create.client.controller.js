
angular.module('tutors').controller('tutorsCreateController', [
  '$rootScope', '$scope', '$location', '$routeParams', 'jwtAuth', 'curp',
  'CatalogService', 'MunicipalityFactory', 'LocalityFactory',  
  'TutorsFactory',
  function($rootScope, $scope, $location, $routeParams, jwtAuth, curp,
           CatalogService, MunicipalityFactory, LocalityFactory,
           TutorsFactory) {

    /**
     * Inicialize the variables.
     */
    $scope.tutor  = {};
    $scope.tutor.doctor = [];
    $scope.tutor.address = [];
    $scope.tutor.phones = [];
    $scope.tutor.phones[0] = {"type": "MOBILE"}; 
    
    $scope.submitted = false;
    $scope.passwordRequired = true;
    $scope.maxDate = new Date();


    /**
     * Variable to front texts.
     */
    $scope.frontInfo = {
      "textButton": 'Guardar',
      "title1": "Administración de responsables",
      "title2": "Alta de tutor"
    };

    $scope.menuSelected = function(menu){
      if(menu.path == "/tutors") {
        menu.selected = true;
      }
    };

    $scope.disableBirthplace =function(){
      if ($scope.tutor.country_id!=484) {
        $scope.birthplace_1 = '{"_id":99,"name":"NO ESPECIFICADO","code":"NE"}';
      }
    }

    /**
     * Load catalogs in the $rootScope
     */
    if (!$rootScope.catalog) {
      CatalogService.load();
    }

    $scope.searchMunicipalities = function(stateId) {
      MunicipalityFactory.get( {'id': stateId},
        function(response) {
          if(response.success) {
            $scope.municipalityList = response.data;
            $scope.tutor.address[0].municipality_id = null;
            $scope.tutor.address[0].locality_id = null;
          }
        }
      );
    };

    $scope.searchLocalities = function(stateId, municipalityId) {
      LocalityFactory.get( {'stateId': stateId, 'municipalityId': municipalityId},
        function(response) {
          if(response.success) {
            $scope.localityList = response.data;
            $scope.tutor.address[0].locality_id = null;
          }
        }
      );
    };

    /**
     * Function to generate the CURP.
     */
    $scope.generateCurp = function() {

      if ($scope.birthdate_1 && $scope.tutor.first_name && $scope.tutor.father_surname &&
          $scope.tutor.mother_surname && $scope.tutor.gender) {

        var birthdateUTC = new Date($scope.birthdate_1.getTime() + $scope.birthdate_1.getTimezoneOffset() * 60000);
        var birthdate = birthdateUTC.getFullYear() + "/" + ("0" + (birthdateUTC.getMonth() + 1)).slice(-2) + "/" + ("0" + birthdateUTC.getDate()).slice(-2);

        $scope.tutor.curp = curp.generate({
          'first_name'      : $scope.tutor.first_name,
          'father_surname'  : $scope.tutor.father_surname,
          'mother_surname'  : $scope.tutor.mother_surname,
          'gender'          : $scope.tutor.gender,
          'state_code'      : JSON.parse($scope.birthplace_1).code,
          'birthdate'       : birthdate
        });
      }
      
    }

    /**
     * Function to update tutor.
     */
    $scope.submit = function () {
      $scope.submitted = true;

      if ($scope.tutorForm.$pristine || $scope.tutorForm.$invalid) {
        $scope.error = 'El formulario no es válido o no ha sido modificado.';
        console.log($scope.tutorForm);
        return;
      }
      
      $scope.tutor.birthdate = new Date($scope.birthdate_1).getTime();
      $scope.tutor.birthplace = JSON.parse($scope.birthplace_1)._id
      
      $scope.tutor.client_creation_date = new Date().getTime();      
      $scope.tutor.password = jwtAuth.encode($scope.password);
      
      $scope.tutor.role = "tutor";
      
      if ($scope.tutor.curp_code) {
        $scope.tutor.curp = $scope.tutor.curp + $scope.tutor.curp_code;
      }

      var tutorsFactory = new TutorsFactory($scope.tutor);

      tutorsFactory.$save(
        function(response) {
          if(response.success) {
            $location.path('tutors/');
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