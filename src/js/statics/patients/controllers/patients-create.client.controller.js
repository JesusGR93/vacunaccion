
angular.module('patients').controller('patientsCreateController', [
  '$rootScope', '$scope', '$location', '$routeParams', '$mdDialog', 'jwtAuth', 'curp',
  'CatalogService', 'MunicipalityFactory', 'LocalityFactory', 
  'PatientsFactory', 'TutorsFactory', 'DoctorsFactory', 'VaccinesFactory', 'CevFactory',
  function($rootScope, $scope, $location, $routeParams, $mdDialog, jwtAuth, curp,
           CatalogService, MunicipalityFactory, LocalityFactory,
           PatientsFactory, TutorsFactory, DoctorsFactory, VaccinesFactory, CevFactory) {

    /**
     * Inicialize the variables.
     */
    $scope.patient  = {};
    $scope.patient.tutor = [];
    $scope.patient.doctor = [];
    $scope.patient.address = [];
    $scope.patient.vaccine = [];
    $scope.vaccineToShow = [];
    $scope.tutorToShow = [];
    $scope.cev = {};

    $scope.submitted = false;
    $scope.maxDate = new Date();
    
    /**
     * Variable to front texts.
     */
    $scope.frontInfo = {
      "textButton": 'Guardar',
      "title1": "Administración de pacientes",
      "title2": "Alta de paciente"

    }

    $scope.menuSelected = function(menu){
      if(menu.path == "/patients") {
        menu.selected = true;
      }
    };

    $scope.disableBirthplace =function(){
      if ($scope.patient.country_id!==484) {
        $scope.birthplace_1 = '{"_id":99,"name":"NO ESPECIFICADO","code":"NE"}';
      }
    }

    /**
     * Load catalogs in the $rootScope
     */
    if (!$rootScope.catalog) {
      CatalogService.load();
    }

    /**
     * Auto assign the doctor in the patient form
     */
    if ($rootScope.loggedUser && $rootScope.loggedUser.role === "doctor") {
      $scope.patient.doctor.push($rootScope.loggedDoctor);
    }

    /**
     * get cev patient if exist
     */
    $scope.getCevPatient = function () {

      if ($scope.cevSearchForm.$invalid) {
        $scope.vaccineError = 'El formulario no válido.';
        console.log($scope.vaccineControlForm);
        return;
      }

      var birthdateUTC = new Date($scope.cev.birthdate.getTime() - $scope.cev.birthdate.getTimezoneOffset() * 60000);

      var cevQuery = {
        'masked_id': $scope.cev.masked_id,
        'birthdate': birthdateUTC.getTime()
      }

      CevFactory.getPatient(cevQuery, 
        function (response) {
          console.log('getCevPatientresponse', response)
          if(response.success) {
            $scope.patient = response.data;

            if ($rootScope.loggedUser && $rootScope.loggedUser.role === "doctor") {
                var doctor = $rootScope.loggedDoctor.user;
                doctor._id = $rootScope.loggedDoctor._id;
                doctor.email = $rootScope.loggedDoctor.email;
                doctor.address[0].state_id = $rootScope.loggedDoctor.user.address[0].state_id._id;
                doctor.address[0].municipality_id = $rootScope.loggedDoctor.user.address[0].municipality_id.id;
                doctor.address[0].locality_id = $rootScope.loggedDoctor.user.address[0].locality_id.id;

                doctor.patient.push($scope.patient._id);
                var doctorsFactory = new DoctorsFactory(doctor); 

                doctorsFactory.$update( {id: $rootScope.loggedUser.id},
                  function(response) {

                    if(response.success) {
                      $location.path('patients/update/' + $scope.patient._id);
                    }
                    else {
                      $scope.error = response.message;
                    }
                  },
                  function(errorResponse) {
                    $scope.error = "Registro no actualizado. " + (errorResponse.data.message || errorResponse.data);
                  }
                );
            }
            else {
              $location.path('patients/update/' + $scope.patient._id);
            }

          }
          else {
            $scope.cevError = response.message;
          }
        },
        function(errorResponse) {
          $scope.cevError = "Registro no recupreado de CEV " + (errorResponse.data.message || errorResponse.data);
        }
      )
    }

    $scope.searchMunicipalities = function(stateId) {
      MunicipalityFactory.get( {'id': stateId},
        function(response) {
          if(response.success) {
            $scope.municipalityList = response.data;
            $scope.patient.address[0].municipality_id = null;
            $scope.patient.address[0].locality_id = null;
          }
        }
      );
    };

    $scope.searchLocalities = function(stateId, municipalityId) {
      LocalityFactory.get( {'stateId': stateId, 'municipalityId': municipalityId},
        function(response) {
          if(response.success) {
            $scope.localityList = response.data;
            $scope.patient.address[0].locality_id = null;
          }
        }
      );
    };

    /**
     * Functionality to remove doctor.
     */
    $scope.removeDoctor = function(doctor) {
      // var index = $scope.patient.doctor.indexOf(doctor);
      // $scope.patient.doctor.splice(index, 1);
    }

    /**
     * Functionality to remove tutor.
     */
    $scope.removeTutor = function(tutor) {
      var index = $scope.patient.tutor.indexOf(tutor);
      $scope.patient.tutor.splice(index, 1);
    }

    /**
     * Functionality to remove vaccine.
     */
    $scope.removeVaccine = function(vaccine) {
      var index = $scope.patient.vaccine.indexOf(vaccine);
      $scope.patient.vaccine.splice(index, 1);

      var index = $scope.vaccineToShow.indexOf(vaccine);
      $scope.vaccineToShow.splice(index, 1);
    }

    /**
     * Function to generate the CURP.
     */
    $scope.generateCurp = function() {

      if ($scope.birthdate_1 && $scope.patient.first_name && $scope.patient.father_surname &&
          $scope.patient.mother_surname && $scope.patient.gender) {

        var birthdateUTC = new Date($scope.birthdate_1.getTime() + $scope.birthdate_1.getTimezoneOffset() * 60000);
        var birthdate = birthdateUTC.getFullYear() + "/" + ("0" + (birthdateUTC.getMonth() + 1)).slice(-2) + "/" + ("0" + birthdateUTC.getDate()).slice(-2);

        console.log($scope.birthplace_1);
        $scope.patient.curp = curp.generate({
          'first_name'      : $scope.patient.first_name,
          'father_surname'  : $scope.patient.father_surname,
          'mother_surname'  : $scope.patient.mother_surname,
          'gender'          : $scope.patient.gender,
          'state_code'      : JSON.parse($scope.birthplace_1).code,
          'birthdate'       : birthdate
        }); 

      }

    }

    /**
     * Function to create patient.
     */
    $scope.submit = function () {
      $scope.submitted = true;

      if ($scope.patientForm.$invalid) {
        $scope.error = 'El formulario no es válido.';
        console.log($scope.patientForm);
        return;
      }

      if ($scope.patient.tutor.length === 0) {
        $scope.error = 'Es necesario agregar al menos un responsable al menor.';
        return;
      }

      $scope.patient.client_creation_date = new Date().getTime();
      $scope.patient.birthdate = new Date($scope.birthdate_1).getTime();
      $scope.patient.birthplace = JSON.parse($scope.birthplace_1)._id
      
      $scope.patient.role = "patient";

      if ($scope.patient.curp_code) {
        $scope.patient.curp = $scope.patient.curp + $scope.patient.curp_code;
      }

      var patientsFactory = new PatientsFactory($scope.patient);
      
      patientsFactory.$save(
        function(response) {
          if(response.success) {

              if ($scope.vaccineControl) {
                  $scope.vaccineControl.patient = response.data._id;

                  VaccinesFactory.save($scope.vaccineControl,
                    function(response) {
                      if(response.success) {
                        $location.path('patients/');
                      }
                      else {
                        $scope.error = response.message;
                      }
                    },
                    function(errorResponse) {
                      $scope.error = "Error al agregar vacuna. " + (errorResponse.data.message || errorResponse.data);
                    }
                  )
              }
              $location.path('patients/');

          }
          else {
            $scope.error = response.message;
          }

        },
        function(errorResponse) {
          $scope.error = "Registro no guardado. " + (errorResponse.data.message || errorResponse.data);
        }
      );

    }

    /**
     * Function to open the modal search and select tutor.
     */
    $scope.openTutorDialog = function($event) {
      $mdDialog.show({
        scope:$scope,
        preserveScope:true,
        controller: tutorDialogController,
        controllerAs: 'tutorCtrl',
        templateUrl: 'tutorDialog.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose:true
      })
    }

    /**
     * Function to open the modal search and select doctor.
     */
    $scope.openDoctorDialog = function($event) {
      $mdDialog.show({
        scope:$scope,
        preserveScope:true,
        controller: doctorDialogController,
        controllerAs: 'doctorCtrl',
        templateUrl: 'doctorDialog.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose:true
      })
    }

    /**
     * Function to open vaccine modal.
     */
    $scope.openVaccineModal = function($event) {
      $mdDialog.show({
        scope:$scope,
        preserveScope:true,
        controller: vaccineModalController,
        controllerAs: 'vaccineCtrl',
        templateUrl: 'vaccineModal.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose:true
      })
    }

  }
]);


function tutorDialogController ($scope, $mdDialog, TutorsFactory) {
    var self = this;
    
    $scope.error = null;

    self.submitted = false;
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
      $scope.error = null;
      self.submitted = true;

      if (self.tutorForm.$invalid) {
        $scope.error = 'El formulario no es válido.';
        console.log(self.tutorForm);
        return;
      }

      for (var i = 0; i < $scope.patient.tutor.length; i++){
        if ($scope.patient.tutor[i].person._id === self.selectedItem._id) {
          $scope.error = 'El tutor seleccionado ya ha sido agregado anteriormente.';
          return;
        }
      }

      var tutor = {
        'person': {
          'user': {
            'first_name': self.selectedItem.user.first_name,
            'mother_surname': self.selectedItem.user.mother_surname,
            'father_surname': self.selectedItem.user.father_surname,
            'curp': self.selectedItem.user.curp
          },
        'email': self.selectedItem.email,
        '_id': self.selectedItem._id,
        },
        'kinship': self.kinship,
      };
      
      $scope.patient.tutor.push(tutor);
      $mdDialog.hide();

    };

    // ******************************
    // Internal methods
    // ******************************

    function querySearch (textSearch) {
      var result;

      TutorsFactory.get({'page':1, 'curp':textSearch},
        function(response) {

          if(response.success) {
            self.responseData = response.data;
          }
          else {
            $scope.error = response.message;
          }
        },
        function(errorResponse) {
          $scope.error = "Error al buscar responsables. " + (errorResponse.data.message || errorResponse.data);
        }
      );

    }
};



function doctorDialogController ($scope, $mdDialog, DoctorsFactory) {
    var self = this;

    $scope.error = null;

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
      $scope.error = null;

      for (var i = 0; i < $scope.patient.doctor.length; i++) {
        if ($scope.patient.doctor[i]._id === self.selectedItem._id) {
          $scope.error = 'El doctor seleccionado ya ha sido agregado anteriormente.';
          return;
        }
      }

      $scope.patient.doctor.push(self.selectedItem);
      $mdDialog.hide();

    };

    // ******************************
    // Internal methods
    // ******************************

    function querySearch (textSearch) {
      var result;

      DoctorsFactory.get({'page':1, 'curp':textSearch},
        function(response) {
          if(response.success) {
            self.responseData = response.data;
          }
          else {
            $scope.error = response.message;
          }
        },
        function(errorResponse) {
          $scope.error = "Error al buscar doctores. " + (errorResponse.data.message || errorResponse.data);
        }
      );

    }
};


function vaccineModalController ($scope, $mdDialog, $routeParams, DoctorsFactory, VaccinesFactory) {
    var self = this;

    self.vaccineError = null;

    self.selectedVaccine = false;
    self.submitted = false;

    // ******************************
    // Template methods
    // ******************************

    self.cancel = function($event) {
      $mdDialog.cancel();
    };

    self.add = function($event) {

      self.submitted = true;

      if (self.vaccineControlForm.$invalid) {
        self.vaccineError = 'El formulario no válido.';
        console.log(self.vaccineControlForm);
        return;
      }

      // vars to get the information from patient form 
      var doctors = JSON.parse(self.vaccineControlData.doctors);
      var dosage  = JSON.parse(self.vaccineControlData.dosage);
      var vaccine = JSON.parse(self.vaccineControlData.dosage);

      // var to show information on the patient form
      var vaccineControlToShow = {
        'application_date' : self.vaccineControlData.application_date.getFullYear() + "/" + ("0" + (self.vaccineControlData.application_date.getMonth() + 1)).slice(-2) + "/" + ("0" + self.vaccineControlData.application_date.getDate()).slice(-2),
        'vaccine'          : dosage.vaccine.name,
        'dose'             : dosage.vaccine.dose + 'ml - ' + dosage.application_age.description,
        'doctor'           : doctors.user.curp,
        'clinic'           : doctors.user.clinic[0].name
      };

      // var to send the information to add the vaccine in the patient.
      $scope.vaccineControl = self.vaccineControlData;

      $scope.vaccineControl.application_date = new Date(self.vaccineControlData.application_date).getTime();
      $scope.vaccineControl.vaccine          = dosage.vaccine._id;
      $scope.vaccineControl.dosage           = dosage._id;
      $scope.vaccineControl.doctors          = [doctors._id];
      $scope.vaccineControl.clinic           = doctors.user.clinic[0]._id;
      $scope.vaccineControl.patient          = $routeParams.id;

      // Check if the dosage vacine already exist in the $scope.patient.vaccine 
      for (var i = 0; i < $scope.patient.vaccine.length; i++) {
        if ($scope.patient.vaccine[i].dosage._id === $scope.vaccineControl.dosage) {
          self.vaccineError = 'La vacuna seleccionado ya ha sido aplicada al menor.';
          return;
        }
      }

      if ($scope.vaccineToShow.length === $scope.patient.vaccine.length) {
        $scope.vaccineToShow.push(vaccineControlToShow);
      }
      else {
        $scope.vaccineToShow.pop();
        $scope.vaccineToShow.push(vaccineControlToShow);
      }

      $mdDialog.hide();
    };

    self.vaccineJsonToObject = function() {
      self.selectedVaccine = true;
      self.dosage = JSON.parse(self.vaccineControlData.dosage);
    }
};