
angular.module('doctors').controller('doctorsUpdateController', [
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
    
    $scope.submitted = false;
    $scope.passwordRequired = false;

    $scope.maxDate = new Date();
    $scope.firstTime = true;

    /**
     * Variable to front texts.
     */
    $scope.frontInfo = {
      "textButton": 'Actualizar',
      "title1": "Administración de médico",
      "title2": "Actualización de médico"
    };

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
            if (!$scope.firstTime) {
              $scope.doctor.address[0].municipality_id = null;
              $scope.doctor.address[0].locality_id = null;
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
              $scope.doctor.address[0].locality_id = null;
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
     * Get the doctor to update.
     */
    DoctorsFactory.getById( {id: $routeParams.id},
      function(response) {


        if(response.success) {
         
          $scope.doctor = response.data.user;
          $scope.doctor.email = response.data.email;

          $scope.doctor.country_id = $scope.doctor.country_id._id;
          $scope.birthplace_1 = JSON.stringify($scope.doctor.birthplace);
          $scope.doctor.birthplace = JSON.parse($scope.birthplace_1)._id

          var birthdate = new Date(parseInt($scope.doctor.birthdate, 10));
          var birthdateUTC = new Date(birthdate.getTime() + birthdate.getTimezoneOffset() * 60000);
          $scope.birthdate_1 = birthdateUTC;

          $scope.doctor.address[0].state_id = $scope.doctor.address[0].state_id._id;
          $scope.doctor.address[0].municipality_id = $scope.doctor.address[0].municipality_id.id;
          $scope.doctor.address[0].locality_id = $scope.doctor.address[0].locality_id.id;

          $scope.searchMunicipalities($scope.doctor.address[0].state_id);
          $scope.searchLocalities($scope.doctor.address[0].state_id, $scope.doctor.address[0].municipality_id);

          if ($scope.doctor.curp.length === 18) {
            $scope.doctor.curp_code = $scope.doctor.curp.substring(16);
            $scope.doctor.curp      = $scope.doctor.curp.substring(0, 16);
          }

          if (!("clinic" in $scope.doctor)) {
            $scope.doctor.clinic = [];
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
     * Function to update doctor.
     */
    $scope.submit = function () {
      $scope.submitted = true;

      if ($scope.doctorForm.$invalid) {
        $scope.error = 'El formulario no es válido o no ha sido modificado.';
        return;
      }

      if ($scope.doctor.clinic.length === 0) {
        $scope.error = 'Favor de agregar al menos una clínica.';
        return;
      }
      
      for (var i = 0; i < $scope.doctor.clinic.length; i++){
        $scope.doctor.clinic[i] = {'_id': $scope.doctor.clinic[i]._id};
      }

      $scope.doctor.birthdate = new Date($scope.birthdate_1).getTime();
      $scope.doctor.birthplace = JSON.parse($scope.birthplace_1)._id


      if ($scope.doctor.curp_code) {
        $scope.doctor.curp = $scope.doctor.curp + $scope.doctor.curp_code;
      }

      if ($scope.password) {
        $scope.doctor.password = jwtAuth.encode($scope.password);
      }

      var doctorsFactory = new DoctorsFactory($scope.doctor); 

      doctorsFactory.$update( {id: $routeParams.id},
        function(response) {

          if(response.success) {
            $location.path('doctors/');
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

      ClinicsFactory.get({'page':1, 'name':textSearch},
        function(response) {

          if(response.success) {
            self.data = response.data;
          }
        }

      );

    }

};
