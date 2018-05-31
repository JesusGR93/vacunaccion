
angular.module('doctors').controller('doctorsCreateController', [
  '$rootScope', '$scope', '$location', '$routeParams', '$mdDialog', 
  'jwtAuth', 'curp', 'CatalogService',
  'DoctorsFactory', 'ClinicsFactory',  'MunicipalityFactory', 'LocalityFactory',
  function($rootScope, $scope, $location, $routeParams, $mdDialog, 
            jwtAuth, curp, CatalogService,
            DoctorsFactory, ClinicsFactory, MunicipalityFactory, LocalityFactory) {

    /**
     * Inicialize the variables.
     */
    $scope.doctor  = {};
    $scope.doctor.clinic = [];
    $scope.doctor.address = [];
    $scope.doctor.phones = [];
    $scope.doctor.phones[0] = {"type": "MOBILE"}; 

    $scope.submitted = false;
    $scope.passwordRequired = true;
    $scope.maxDate = new Date();

    /**
     * Variable to front texts.
     */
    $scope.frontInfo = {
      "textButton": 'Guardar',
      "title1": "Administración de médicos",
      "title2": "Alta de médicos"
    }

    $scope.menuSelected = function(menu){
      if(menu.path == "/doctors") {
        menu.selected = true;
      }
    };

    $scope.disableBirthplace =function(){
      if ($scope.doctor.country_id!==484) {
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
            $scope.doctor.address[0].municipality_id = null;
            $scope.doctor.address[0].locality_id = null;
          }
        }
      );
    };

    $scope.searchLocalities = function(stateId, municipalityId) {
      LocalityFactory.get( {'stateId': stateId, 'municipalityId': municipalityId},
        function(response) {
          if(response.success) {
            $scope.localityList = response.data;
            $scope.doctor.address[0].locality_id = null;
          }
        }
      );
    };


    /**
     * Function to generate the CURP.
     */
    $scope.generateCurp = function() {

      if ($scope.birthdate_1 && $scope.doctor.first_name && $scope.doctor.father_surname &&
          $scope.doctor.mother_surname && $scope.doctor.gender) {
        var birthdateUTC = new Date($scope.birthdate_1.getTime() + $scope.birthdate_1.getTimezoneOffset() * 60000);
        var birthdate = birthdateUTC.getFullYear() + "/" + ("0" + (birthdateUTC.getMonth() + 1)).slice(-2) + "/" + ("0" + birthdateUTC.getDate()).slice(-2);

        $scope.doctor.curp = curp.generate({
          'first_name'      : $scope.doctor.first_name,
          'father_surname'  : $scope.doctor.father_surname,
          'mother_surname'  : $scope.doctor.mother_surname,
          'gender'          : $scope.doctor.gender,
          'state_code'      : JSON.parse($scope.birthplace_1).code,
          'birthdate'       : birthdate
        });

      }

    }

    /**
     * Function to create doctor.
     */
    $scope.submit = function () {
      $scope.submitted = true;

      if ($scope.doctorForm.$pristine || $scope.doctorForm.$invalid) {
        $scope.error = 'El formulario no es válido o no ha sido modificado.';
        return;
      }

      if ($scope.doctor.clinic.length === 0) {
        $scope.error = 'Favor de agregar al menos una clínica.';
        return;
      }

      $scope.doctor.birthdate = new Date($scope.birthdate_1).getTime().toString();
      $scope.doctor.birthplace = JSON.parse($scope.birthplace_1)._id

      $scope.doctor.client_creation_date = new Date().getTime();
      $scope.doctor.password = jwtAuth.encode($scope.password);

      $scope.doctor.role = "doctor";

      if ($scope.doctor.curp_code) {
        $scope.doctor.curp = $scope.doctor.curp + $scope.doctor.curp_code;
      }

      var doctorsFactory = new DoctorsFactory($scope.doctor);

      doctorsFactory.$save(
        function(response) {
          if(response.success) {
            $location.path('doctors/');
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

    /**
     * Functionality to add/remove clinic.
     */
    $scope.addClinic = function(clinic) {
      // $scope.clinic = JSON.parse($scope.clinic);

      for (var i = 0; i < $scope.doctor.clinic.length; i++){
        if ($scope.doctor.clinic[i]._id === clinic._id) {
          return;
        }
      }

      $scope.doctor.clinic.push(clinic);
      $scope.clinic = "";
    }
    
    $scope.removeClinic = function(doctorClinic) {
      var index = $scope.doctor.clinic.indexOf(doctorClinic);
      $scope.doctor.clinic.splice(index, 1);
    }

    /**
     * Function to open the modal search and select clinic.
     */
    $scope.openDialog = function($event) {
      $mdDialog.show({
        scope:$scope,
        preserveScope:true,
        controller: DialogController,
        controllerAs: 'ctrl',
        templateUrl: 'dialog.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose:true
      })
    }
  }
]);


function DialogController ($scope, $mdDialog, ClinicsFactory) {
    var self = this;

    self.querySearch   = querySearch;
    self.selectedItem  = null;
    self.searchText    = null;
    self.data = [];

    // ******************************
    // Template methods
    // ******************************

    self.cancel = function($event) {
      $mdDialog.cancel();
    };
    self.add = function($event) {
      $scope.addClinic(self.selectedItem);
      $mdDialog.hide();
    };

    // ******************************
    // Internal methods
    // ******************************

    function querySearch (textSearch) {
      var result;

      ClinicsFactory.get({'page':1, 'name':textSearch},
        function(response) {

          if(response.success) {
            self.data = response.data;
          }
          else {
            $scope.error = response.message;
          }
        },
        function(errorResponse) {
          $scope.error = "Error al buscar clínicas. " + (errorResponse.data.message || errorResponse.data);
        }
      );

    }

};
