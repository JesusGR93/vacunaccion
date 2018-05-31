
angular.module('tutors').controller('tutorsUpdateController', [
  '$rootScope', '$scope', '$location', '$routeParams', 'jwtAuth', 'curp',
  'CatalogService', 'MunicipalityFactory', 'LocalityFactory',  
  'TutorsFactory',
  function($rootScope, $scope, $location, $routeParams, jwtAuth, curp,
           CatalogService, MunicipalityFactory, LocalityFactory,
           TutorsFactory) {

    /**
     * Inicialize the variables.
     */
    $scope.submitted = false;
    $scope.passwordRequired = false;

    $scope.maxDate = new Date();
    $scope.firstTime = true;

    /**
     * Variable to front texts.
     */
    $scope.frontInfo = {
      "textButton": 'Actualizar',
      "title1": "Administración de responsables",
      "title2": "Actualización de tutor"
    };
  
    $scope.disableBirthplace =function(){
      if ($scope.tutor.country_id!=484) {
        $scope.birthplace_1 = '{"_id":99,"name":"NO ESPECIFICADO","code":"NE"}';
      }
    }

    // Change or upload image
    $scope.menuSelected = function(menu){
      if(menu.path == "/tutors") {
        menu.selected = true;
      }
    };

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
            if (!$scope.firstTime) {
              $scope.tutor.address[0].municipality_id = null;
              $scope.tutor.address[0].locality_id = null;
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
              $scope.tutor.address[0].locality_id = null;
            }
            $scope.firstTime = false;
          }
        }
      );
    };

    /**
     * Function to generate the CURP.
     */
    $scope.generateCurp = function() {

      if ($scope.tutor.country_id!==484) {
        $scope.birthplace_1 = '{"_id":99,"name":"NO ESPECIFICADO","code":"NE"}';
      }

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
     * Get the tutor to update.
    */
    TutorsFactory.getById( {id: $routeParams.id},
      function(response) {

        console.log('getTutorById', response);

        if(response.success) {
          
          $scope.tutor = response.data.user;
          $scope.tutor.email = response.data.email;

          $scope.tutor.country_id = $scope.tutor.country_id._id;
          $scope.birthplace_1 = JSON.stringify($scope.tutor.birthplace);

          var birthdate = new Date(parseInt($scope.tutor.birthdate, 10));
          var birthdateUTC = new Date(birthdate.getTime() + birthdate.getTimezoneOffset() * 60000);
          $scope.birthdate_1 = birthdateUTC;

          $scope.tutor.address[0].state_id = $scope.tutor.address[0].state_id._id;
          $scope.tutor.address[0].municipality_id = $scope.tutor.address[0].municipality_id.id;
          $scope.tutor.address[0].locality_id = $scope.tutor.address[0].locality_id.id;

          $scope.searchMunicipalities($scope.tutor.address[0].state_id);
          $scope.searchLocalities($scope.tutor.address[0].state_id, $scope.tutor.address[0].municipality_id);

          if ($scope.tutor.curp.length === 18) {
            $scope.tutor.curp_code = $scope.tutor.curp.substring(16);
            $scope.tutor.curp      = $scope.tutor.curp.substring(0, 16);
          }

        }
        else {
          $scope.error = response.message;
        }
      },
      function(errorResponse) {
        $scope.error = "Registro con id=" + $routeParams.id + " no recuperado. " + (errorResponse.data.message || errorResponse.data);
      }
    );

    /**
     * Function to update tutor.
     */
    $scope.submit = function () {

      if ($rootScope.loggedUser && $rootScope.loggedUser.role==='doctor') {
        $scope.error = "Usuario no autorizado para actualizar el registro.";
        return;
      }

      $scope.submitted = true;

      if ($scope.tutorForm.$invalid) {
        $scope.error = 'El formulario no es válido o no ha sido modificado.';
        console.log($scope.tutorForm);
        return;
      }

      $scope.tutor.birthdate  = new Date($scope.birthdate_1).getTime();
      $scope.tutor.birthplace = JSON.parse($scope.birthplace_1)._id

      if ($scope.tutor.curp_code) {
        $scope.tutor.curp = $scope.tutor.curp + $scope.tutor.curp_code;
      }

      if ($scope.password) {
        $scope.tutor.password = jwtAuth.encode($scope.password);
      }

      var tutorsFactory = new TutorsFactory($scope.tutor);

      tutorsFactory.$update( {id: $routeParams.id},
        function(response) {
          
          console.log(response);

          if(response.success) {
            $location.path('tutors/');
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