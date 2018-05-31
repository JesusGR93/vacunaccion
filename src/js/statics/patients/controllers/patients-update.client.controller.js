
angular.module('patients').controller('patientsUpdateController', [
  '$rootScope', '$scope', '$location', '$routeParams', '$mdDialog', 'jwtAuth', 'curp',
  'CatalogService', 'MunicipalityFactory', 'LocalityFactory', 
  'PatientsFactory', 'TutorsFactory', 'DoctorsFactory', 'VaccinesFactory', 'CevFactory',
  function($rootScope, $scope, $location, $routeParams, $mdDialog, jwtAuth, curp,
           CatalogService, MunicipalityFactory, LocalityFactory,
           PatientsFactory, TutorsFactory, DoctorsFactory, VaccinesFactory, CevFactory) {

    /**
     * Inicialize the variables.
     */
    $scope.patient = {};
    $scope.vaccineToShow = [];
    $scope.cevPatient = false;

    $scope.submitted = false;
    $scope.maxDate = new Date();
    $scope.firstTime = true;
    
    /**
     * Variable to front texts.
     */
    $scope.frontInfo = {
      "textButton": 'Actualizar',
      "title1": "Administración de pacientes",
      "title2": "Actualización de paciente"

    };

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
     * get cev patient if exist
     */
    $scope.getCevPatient = function () {

      if ($scope.cevSearchForm.$invalid) {
        $scope.vaccineError = 'El formulario no válido.';
        return;
      }

      var birthdateUTC = new Date($scope.cev.birthdate.getTime() - $scope.cev.birthdate.getTimezoneOffset() * 60000);

      var cevQuery = {
        'masked_id': $scope.cev.masked_id,
        'birthdate': birthdateUTC.getTime()
      }

      CevFactory.getPatient(cevQuery, 
        function (response) {
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
            if (!$scope.firstTime) {
              $scope.patient.address[0].municipality_id = null;
              $scope.patient.address[0].locality_id = null;
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
              $scope.patient.address[0].locality_id = null;
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

      if ($scope.birthdate_1 && $scope.patient.first_name && $scope.patient.father_surname &&
          $scope.patient.mother_surname && $scope.patient.gender) {

        var birthdateUTC = new Date($scope.birthdate_1.getTime() + $scope.birthdate_1.getTimezoneOffset() * 60000);
        var birthdate = birthdateUTC.getFullYear() + "/" + ("0" + (birthdateUTC.getMonth() + 1)).slice(-2) + "/" + ("0" + birthdateUTC.getDate()).slice(-2);

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
     * Function to get the vaccines.
     */
    $scope.initPatientVaccines = function() {
      VaccinesFactory.getPatientVaccines( {id: $routeParams.id},
        function(response) {
          if(response.success) {

            // Add the vaccine in the $scope.vaccineToShow to show the info on the patient form
            $scope.vaccines = [] ;

            for (var i = 0; i < response.data.length; i++) {

              $scope.vaccines.push(response.data[i]);

              var application_date = new Date(parseInt(response.data[i].application_date, 10));
              var application_date_utc = new Date(application_date.getTime() + application_date.getTimezoneOffset() * 60000);
              application_date_utc = application_date_utc.getFullYear() + "/" + ("0" + (application_date_utc.getMonth() + 1)).slice(-2) + "/" + ("0" + application_date_utc.getDate()).slice(-2);

              $scope.vaccineToShow.push({
                'vaccine'          : response.data[i].dosage.description,
                'dose'             : response.data[i].vaccine.dose + 'ml - ' + response.data[i].vaccine.administration_route.name,
                'application_date' : application_date_utc
              });

            }
          }
          else {
            $scope.error = response.message;
          }
        },
        function(errorResponse) {
          $scope.error = "Error al buscar vacunas. " + (errorResponse.data.message || errorResponse.data);
        }
      );
    };

    /**
     * Function to det the patient to update.
     */

    $scope.initGetPatientById = function() {
      PatientsFactory.getById( {id: $routeParams.id},

        function(response) {


          if(response.success) {

            $scope.patient = response.data;

            if ($scope.patient.cev_id) {
              $scope.cevPatient = true;
            }

            if (!("doctor" in $scope.patient)) {
              $scope.patient.doctor = [];
            }
            if (!("tutor" in $scope.patient)) {
              $scope.patient.tutor = [];
            }
                   
            $scope.birthplace_1 = JSON.stringify($scope.patient.birthplace);
            $scope.patient.birthplace = $scope.birthplace_1._id;

            var birthdate = new Date(parseInt($scope.patient.birthdate, 10));
            var birthdateUTC = new Date(birthdate.getTime() + birthdate.getTimezoneOffset() * 60000);
            $scope.birthdate_1 = birthdateUTC;

            $scope.patient.country_id = $scope.patient.country_id._id;
            $scope.patient.address[0].state_id = $scope.patient.address[0].state_id._id;
            $scope.patient.address[0].municipality_id = $scope.patient.address[0].municipality_id.id;
            $scope.patient.address[0].locality_id = $scope.patient.address[0].locality_id.id;

            $scope.searchMunicipalities($scope.patient.address[0].state_id);
            $scope.searchLocalities($scope.patient.address[0].state_id, $scope.patient.address[0].municipality_id);

            if ($scope.patient.curp.length === 18) {
              $scope.patient.curp_code = $scope.patient.curp.substring(16);
              $scope.patient.curp      = $scope.patient.curp.substring(0, 16);
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
    };

    /**
     * Functionality to remove doctor.
     */
    $scope.removeDoctor = function(doctor) {
      var index = $scope.patient.doctor.indexOf(doctor);
      $scope.patient.doctor.splice(index, 1);
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
    /*
    $scope.removeVaccine = function(vaccine) {
      var index = $scope.vaccines.indexOf(vaccine);
      $scope.vaccines.splice(index, 1);

      var index = $scope.vaccineToShow.indexOf(vaccine);
      $scope.vaccineToShow.splice(index, 1);
    } 
    */

    /**
     * Function to update patient.
     */
    $scope.submit = function () {
      $scope.submitted = true;

      if ($scope.patientForm.$invalid) {
        $scope.error = 'El formulario no es válido.';
        return;
      }

      if ($scope.patient.tutor.length === 0) {
        $scope.error = 'Es necesario agregar al menos un responsable al menor.';
        return;
      }
      
      $scope.patient.birthdate = new Date($scope.birthdate_1).getTime();
      $scope.patient.birthplace = JSON.parse($scope.birthplace_1)._id

      if ($scope.patient.curp_code) {
        $scope.patient.curp = $scope.patient.curp + $scope.patient.curp_code;
      }

      var patientsFactory = new PatientsFactory($scope.patient); 

      patientsFactory.$update( {id: $routeParams.id},
        function(response) {
          
          if(response.success) {

              if ($scope.vaccineControl) {

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
            $scope.error = errorResponse.message;
          }

        },
        function(errorResponse) {
          $scope.error = "Registro no actualizado. " +(errorResponse.data.message || errorResponse.data);
        }
      );

    };

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

    /**submi
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
    self.maxDate = new Date();

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
        'dose'             : dosage.vaccine.dose + 'ml - ',
        'doctor'           : doctors.user.curp,
      };

      if (doctors.user.clinic.length === 0) {
        self.vaccineError = 'El doctor selelccionado no tiene alguna clínica asignada.';
        return;
      }

      // var to send the information to add the vaccine in the patient.
      $scope.vaccineControl = angular.copy(self.vaccineControlData);


      $scope.vaccineControl.application_date = self.vaccineControlData.application_date.getTime() + self.vaccineControlData.application_date.getTimezoneOffset() * 60000;
      $scope.vaccineControl.vaccine          = dosage.vaccine._id;
      $scope.vaccineControl.dosage           = dosage._id;
      $scope.vaccineControl.doctors          = [doctors._id];
      $scope.vaccineControl.clinic           = doctors.user.clinic[0];
      $scope.vaccineControl.patient          = $routeParams.id;

      
      if ($scope.vaccineControl.expiration) {
        $scope.vaccineControl.expiration = self.vaccineControlData.expiration.getTime() + self.vaccineControlData.expiration.getTimezoneOffset() * 60000;
      }

      if ( dosage.application_age && dosage.application_age.description) {
        vaccineControlToShow.dose = vaccineControlToShow.dose + dosage.application_age.description;
      }

      // Check if the dosage vacine already exist in the $scope.vaccines 
      for (var i = 0; i < $scope.vaccines.length; i++) {
        if ($scope.vaccines[i].dosage._id === $scope.vaccineControl.dosage) {
          self.vaccineError = 'La vacuna seleccionado ya ha sido aplicada al menor.';
          return;
        }
      }
      
      if ($scope.vaccineToShow.length == $scope.vaccines.length) {
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