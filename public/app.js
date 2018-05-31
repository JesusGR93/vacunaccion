// Invoke 'strict' JavaScript mode
'use strict';

// Set the main appliccation name
var mainApplicationModuleName = 'mean';
document.write('<script type="text/javascript" src="/angular-pagination.js"></script>');

// Create the main application
var mainApplicationModule = angular.module(mainApplicationModuleName,
    [
      'ngResource', 'ngRoute', 'ngMaterial','ngFileUpload', 'ui.bootstrap',
      'configuration',
      'base64',
      'tools',
      'login',
      'asideMenu','index', 'catalogs',
      'admins', 'doctors', 'tutors', 'patients', 'clinics', 'vaccines','ngPagination'
    ]);

// Configure the hashbang URLs using the $locationProvider services
mainApplicationModule.config(['$locationProvider', '$mdThemingProvider', '$mdDateLocaleProvider',
  function($locationProvider, $mdThemingProvider, $mdDateLocaleProvider) {
      
    $locationProvider.hashPrefix('!');

    $mdThemingProvider.theme('default')
      .primaryPalette('green');

    $mdDateLocaleProvider.formatDate = function(date) {
      return date ? moment(date).format('DD-MM-YYYY') : '';
    };
    
    $mdDateLocaleProvider.parseDate = function(dateString) {
      var m = moment(dateString, 'DD-MM-YYYY', true);
      return m.isValid() ? m.toDate() : new Date(NaN);
    };

  }
]);

if(window.location.hash === '#_=_') window.location.hash = '#!';

// Manually bootstrap the AngularJS application
angular.element(document).ready(function() {
    angular.bootstrap(document, [mainApplicationModuleName]);
});
// Create the 'index' module
angular.module('admins', ['components']); 

// Create the 'index' module
angular.module('asideMenu', []); 


angular.module('catalogs', []); 


angular.module('clinics', ['components']); 


angular.module('components', []);
angular.module("configuration",[]);


angular.module('doctors', ['components']);
// Create the 'index' module

angular.module('index', []); 
// Create the 'login' module
angular.module('login', []);


angular.module('patients', ['components']);
angular.module('tools',[]);


angular.module('tutors', ['components']);
// Create the 'index' module
angular.module('vaccines', ['components']);


angular.module('admins').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/admins', {
      templateUrl: 'admins/views/admins-list.client.view.html',
      controller: 'AdminsListController'
    })
    .when('/admins/create', {
      templateUrl: 'admins/views/admins-create-update.client.view.html',
      controller: 'AdminsCreateController'
    })
    .when('/admins/update/:id', {
      templateUrl: 'admins/views/admins-create-update.client.view.html',
      controller: 'AdminsUpdateController'
    });
  }
]);


angular.module('admins').controller('AdminsCreateController', [
  '$scope', '$location', '$routeParams', 'jwtAuth', 'AdminsFactory',

  function($scope, $location, $routeParams, jwtAuth, AdminsFactory) {
    
    // Inicialize the variables.
  	$scope.admin = {};
  	$scope.submitted = false;
    $scope.passwordRequired = true;

    // Variable to front texts 
    $scope.frontTexts = {
      button: 'Guardar',
      title1: 'Administración',
      title2: 'Alta de Administrador'
    }

    $scope.menuSelected = function(menu){
      if(menu.path == "/admins") {
        menu.selected = true;
      }
    };

    // Create adminstrator
    $scope.submit = function () {
    	$scope.submitted = true;

    	if ($scope.adminForm.$pristine || $scope.adminForm.$invalid) {
        $scope.error = 'El formulario no es válido o no ha sido modificado.';
       
    		return;
    	}

    	if ($scope.password1 !== $scope.password2) {
        $scope.password1 = "";
        $scope.password2 = "";
    		$scope.error = "Las contraseñas no coinciden. Favor de reingresarlas.";
        return;
    	}

      $scope.admin.password = jwtAuth.encode($scope.password1);
      $scope.admin.role = 'admin';

    	var adminFactory = new AdminsFactory($scope.admin);

    	adminFactory.$save(
    		function(response) {
	    		if(response.success) {
	    			$location.path('admins/');
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

angular.module('admins').controller('AdminsUpdateController', [
  '$scope', '$location', '$routeParams', 'jwtAuth', 'AdminsFactory',

  function($scope, $location, $routeParams, jwtAuth, AdminsFactory) {

    // Inicialize the variables.
  	$scope.admin = {};
  	$scope.submitted = false;
    $scope.passwordRequired = false;

    // Variable to front texts
    $scope.frontTexts = {
      button: 'Actualizar',
      title1: 'Administración',
      title2: 'Actualización de Administrador'
    }

    $scope.menuSelected = function(menu){
      if (menu.path == "/admins/update/" + $routeParams.id) {
        menu.selected = true;
      }
    };

    // Get the adminstrator to update.
    AdminsFactory.getById( {id: $routeParams.id},
      function(response) {
        if(response.success) { 
          $scope.admin = response.data.user;
          $scope.admin.email = response.data.email;
        }
        else {
          $scope.error = response.message;
        }
      },
      function(errorResponse) {
        $scope.error = "Registro con id=" + $routeParams.id + " no recuperado. " + (errorResponse.data.message || errorResponse.data);
      }
    );

    // Update adminstrator
    $scope.submit = function () {
    	$scope.submitted = true;

      if ($scope.adminForm.$pristine || $scope.adminForm.$invalid) {
        $scope.error = 'El formulario no es válido o no ha sido modificado.';
    	
        return;
    	}

    	if ($scope.password1 !== $scope.password2) {
        $scope.password1 = "";
        $scope.password2 = "";
    		$scope.error = "Las contraseñas no coinciden. Favor de reingresarlas.";
        return;
    	}

      if ($scope.password1) {
        $scope.admin.password = jwtAuth.encode($scope.password1);
      }
      
      var adminFactory = new AdminsFactory($scope.admin); 

    	adminFactory.$update( {id: $routeParams.id},
    		function(response) {
	    		if(response.success) {
	    			$location.path('admins/');
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

angular.module('admins').factory('AdminsFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {

    return $resource('api/'+API_VERSION+'/admins', {}, {

      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      save: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      getById: {
        url: 'api/'+API_VERSION+'/admins/:id',
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      update: {
        url: 'api/'+API_VERSION+'/admins/:id',
        method:'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      remove: {
        url: 'api/'+API_VERSION+'/admins/:id',
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }
    });

  }
  
]);
angular.module('asideMenu').constant('AsideMenuPath', '/asideMenu/views/asideMenu.client.view.html');

angular.module('asideMenu').controller('AsideMenuController', [
  '$scope','$routeParams', '$location',
  'Tools','jwtAuth','AuthToShow',
  'AsideMenuPath','AsideMenuArray',
  function($scope, $routeParams, $location,
  Tools,jwtAuth,AuthToShow,
  AsideMenuPath,AsideMenuArray){

    $scope.index_aside = AsideMenuPath;
    $scope.asideMenu = AsideMenuArray;

    $scope.loggedUser = {};

    $scope.isAuthenticated = function(){
      $scope.loggedUser = jwtAuth.isAuthed();
      if (!$scope.loggedUser.isAuthed) {
        $location.path('login');
      }

      if (!AuthToShow.isAuthed($location.$$path)) {
        $location.path('/');
      }
    };

    $scope.logout = function(){
      jwtAuth.logout();
      $location.path('login');
      window.location.reload();
    };
    $scope.asideMenuEvent = function(path){
      $location.path(path);
    };

    $scope.init = function(){
      $scope.isAuthenticated();

      for (var i = 0; i < $scope.asideMenu.length; i++) {
        if (AsideMenuArray[i].tag === "MI PERFIL") {
          
          if ($scope.loggedUser.role === "admin") {
            AsideMenuArray[i].path = "/admins/update/" + $scope.loggedUser.id;
          }
          if ($scope.loggedUser.role === "doctor") {
            AsideMenuArray[i].path = "/doctors/update/" + $scope.loggedUser.id;
          }
          if ($scope.loggedUser.role === "tutor") {
            AsideMenuArray[i].path = "/tutors/update/" + $scope.loggedUser.id;
          }
        }
        AsideMenuArray[i].selected = false;
      }
    };

    $scope.mustBeShow = function(path){
      return AuthToShow.isAuthed(path);
    };
  }
]);

angular.module('asideMenu').factory('AsideMenuArray',['$resource',
  function($resource){

    return [
      {
        selected:   false,
        view:       "",
        tag:        "MI PERFIL",
        ic:         "./img/ic_medico",
        path:       ""
      },
      {
        selected:   false,
        view:       "/index/views/index-admon-list.client.view.html",
        tag:        "ADMINISTRADORES",
        ic:         "./img/ic_tutor",
        path:       "/admins"
      },
      {
        selected:   false,
        view:       "",
        tag:        "ADMINISTRACIÓN DE MÉDICOS",
        ic:         "./img/ic_medico",
        path:       "/doctors"
      },
      {
        selected:   false,
        view:       "",
        tag:        "ADMINISTRACIÓN DE RESPONSABLES",
        ic:         "./img/ic_tutor",
        path:       "/tutors"
      },
      {
        selected:   false,
        view:       "",
        tag:        "ADMINISTRACIÓN DE PACIENTES",
        ic:         "./img/ic_menor",
        path:       "/patients"
      },
      {
        selected:   false,
        view:       "",
        tag:        "CENTROS DE SALUD",
        ic:         "./img/ic_detalle",
        path:       "/clinics"
      }
      /*,
      {
        selected:   false,
        view:       "",
        tag:        "Administración de vacunas",
        ic:         "./img/ic_editar",
        path:       "/vaccines"
      }*/
    ];
  }
]);

angular.module('asideMenu').service('AuthToShow', [
  'jwtAuth',
  function(jwtAuth) {

    var _this = this;

    _this.isAuthed = function(path){
      _this.loggedUser = jwtAuth.isAuthed();


      if (_this.loggedUser.role=="tutor") {
        if (path == "/admins" || path == "/admins/create") {
          return false;
        }
        if (path == "/doctors" || path == "/doctors/create") {
          return false;
        }
        if (path == "/tutors" || path == "/tutors/create") {
          return false;
        }
        if (path == "/clinics" || path == "/clinics/create") {
          return false;
        }
      }

      if (_this.loggedUser.role=="doctor") {
        if (path == "/admins" || path == "/admins/create") {
          return false;
        }
        if (path == "/doctors" || path == "/doctors/create") {
          return false;
        }
      }

      return true;
    };
  }
]);


angular.module('catalogs').factory('AffiliationFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/affiliations', {}, {

      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);


angular.module('catalogs').factory('BloodTypeFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/bloodTypes', {}, {

      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);


angular.module('catalogs').service('CatalogService', [
   '$rootScope', 'AffiliationFactory', 'BloodTypeFactory', 'CountryFactory', 'VaccineDosageFactory',
  'KinshipFactory', 'StateFactory', 'StreetTypeFactory', 'SuburbTypeFactory', 'VaccineFactory',
  function($rootScope, AffiliationFactory, BloodTypeFactory, CountryFactory, VaccineDosageFactory,
           KinshipFactory, StateFactory, StreetTypeFactory, SuburbTypeFactory, VaccineFactory) {

    this.load = function() {

      $rootScope.catalog = {};

      $rootScope.catalog.gender = ['HOMBRE', 'MUJER'];


      AffiliationFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.affiliations = response.data;
          } 
          else {
            console.log("Error to get affiliations not found");
          }
        },
        function(errorResponse) {
          console.log("ErrorResponse to get affiliations not found");
        }
      );


      BloodTypeFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.bloodTypes = response.data;
          } 
          else {
            console.log("Error to get blood types not found");
          }
        },
        function(errorResponse) {
            console.log("ErrorResponse to get blood types not found");
        }
      );


      CountryFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.countries = response.data;
          } 
          else {
            console.log("Error to get countries not found");
          }
        },
        function(errorResponse) {
          console.log("ErrorResponse to get blood types not found");
        }
      );


      KinshipFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.kinships = response.data;
          } 
          else {
            console.log("Error to get states not found");
          }
        },
        function(errorResponse) {
          console.log("ErrorResponse to get states not found");
        }
      );


      StateFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.states = response.data;
          } 
          else {
            console.log("Error to get states not found");
          }
        },
        function(errorResponse) {
          console.log("ErrorResponse to get states not found");
        }
      );


      StreetTypeFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.streetTypes = response.data;
          }
          else {
            console.log("Error to get street types not found");
          }
        },
        function(errorResponse){
          console.log("ErrorResponse to get street types not found");
        }
      ); 


      SuburbTypeFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.suburbTypes = response.data;
          }
          else {
            console.log("Error to get suburbs types not found");
          }
        },
        function(errorResponse){
          console.log("ErrorResponse to get suburbs types not found");
        }
      ); 

      VaccineFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.vaccines = response.data;
          }
          else {
            console.log("Error to get vaccines not found");
          }
        },
        function(errorResponse){
          console.log("ErrorResponse to get vaccines not found");
        }
      ); 

      VaccineDosageFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.vaccinesDosage = response.data;
          }
          else {
            console.log("Error to get dosage vaccines not found");
          }
        },
        function(errorResponse){
          console.log("ErrorResponse to get dosage vaccines not found");
        }
      ); 

    }
  }

]);


angular.module('catalogs').factory('CountryFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/countries', {}, {

      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      getById: {
        url: 'api/'+API_VERSION+'/countries/:id',
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);


angular.module('catalogs').factory('KinshipFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/kinships', {}, {

      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      getById: {
        url: 'api/'+API_VERSION+'/kinships/:id',
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);


angular.module('catalogs').factory('LocalityFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/localities', {}, {
      
      // Filter localities by state and municipality 
      get: {
        url: 'api/'+API_VERSION+'/localities/:stateId/state/:municipalityId/municipality',
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);


angular.module('catalogs').factory('MunicipalityFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    return $resource('api/'+API_VERSION+'/municipalities', {}, {
      

      // Filter municipalities by state
      get: {
        url: 'api/'+API_VERSION+'/municipalities/:id/state',
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },

    });

  }
  
]);


angular.module('catalogs').factory('StateFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/states', {}, {

      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
    });

  }
  
]);


angular.module('catalogs').factory('StreetTypeFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/streetTypes', {}, {

      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      getById: {
        url: 'api/'+API_VERSION+'/streetTypes/:id',
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);


angular.module('catalogs').factory('SuburbTypeFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/suburbTypes', {}, {

      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      getById: {
        url: 'api/'+API_VERSION+'/suburbTypes/:id',
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);


angular.module('catalogs').factory('VaccineFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/vaccines', {}, {

      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);


angular.module('catalogs').factory('VaccineDosageFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/vaccinesControls', {}, {

      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);


angular.module('catalogs').factory('VaccineDosageFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/dosageVaccines', {}, {

      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);


angular.module('clinics').config(['$routeProvider',

  function($routeProvider) {
    $routeProvider.
      when('/clinics', {
        templateUrl: 'clinics/views/clinics-list.client.view.html',
        controller: 'clinicsListController'
      }).
      when('/clinics/create', {
        templateUrl: 'clinics/views/clinics-create-update.client.view.html',
        controller: 'clinicsCreateController'
      }).
      when('/clinics/update/:id', {
        templateUrl: 'clinics/views/clinics-create-update.client.view.html',
        controller: 'clinicsUpdateController'
      });
  }

]);


angular.module('clinics').controller('clinicsCreateController', [
  '$rootScope', '$scope', '$location', '$routeParams', 'CatalogService',
  'ClinicsFactory', 'MunicipalityFactory', 'LocalityFactory','$filter',
  function($rootScope, $scope, $location, $routeParams, CatalogService,
    ClinicsFactory, MunicipalityFactory, LocalityFactory,$filter) {

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


angular.module('clinics').controller('clinicsListController', 
  ['$rootScope','$scope', '$filter',  '$location', '$routeParams', '$mdDialog','ClinicsFactory',
  'StateFactory', 'DoctorsFactory','MunicipalityFactory','LocalityFactory','jwtAuth','CountryFactory', 'CatalogService',
  function($rootScope, $scope,$filter, $location, $routeParams, $mdDialog,ClinicsFactory,StateFactory,
    DoctorsFactory, MunicipalityFactory,LocalityFactory, jwtAuth,CountryFactory, CatalogService) {
    
      $scope.tabla =
     [{name:'Nombre',id:'id'},
      {name:'Registro Sanitario',id:'name'}];


      //variables de filtrado de estado, municipio y localidad   

     $scope.selected = { 
        state:'',
        idState:'',
        nameState:'',
        municipality:'',
        municipalityId:'',
        idLocality:''};

    // Load catalogs
    if (!$rootScope.catalog) {
      CatalogService.load();
    }

    //Load the Country
    CountryFactory.get(
      function(response) {
        if(response.success) {
          $rootScope.catalog.countries = response.data;
        } 
        else {
          console.log("Error to get countries not found");
        }
      },
      function(errorResponse) {
        console.log("ErrorResponse to get blood types not found");
      }
    );
//Load the Municipal
    $scope.searchMunicipalities = function(stado) {
      $scope.selected.idState=stado._id;
      $scope.selected.nameState=stado.name;
      $scope.getClinics();
      MunicipalityFactory.get( {'id': stado._id},
        function(response) {
          if(response.success) {
            $rootScope.catalog.municipalityList = response.data;
          }
        }
      );
    };

    //Load the Localities
    $scope.searchLocalities = function(datos) {
      $scope.selected.municipalityId=datos.id;
      $scope.getClinics();
      LocalityFactory.get( {'stateId': datos.state_id, 'municipalityId': datos.id},
        function(response) {
          if(response.success) {
            $scope.localityList = response.data;
         }
        }
      );
    };

    // Variable to select the nav icon
    $scope.menuSelected = function(menu){
      if(menu.path == "/clinics") {
        menu.selected = true;
      }
    };

    // Pagination variables.
    $scope.pagination = {};
    $scope.maxSize = 10;
    $scope.page = 1;

    // query variables
    $scope.query = {
      'name': "",
      'page': 1
    };

    $scope.clearQuery = function () {
      $scope.query= {};
      $scope.selected = { 
        state:'',
        idState:'',
        nameState:'',
        municipality:'',
        municipalityId:'',
        idLocality:''};
      $scope.getClinics();
    };

    // Load the clinics list without filtered
    $scope.getClinics = function () {


      if (!$rootScope.loggedUser) {
        $rootScope.loggedUser = {};
        $rootScope.loggedUser = jwtAuth.isAuthed();
      }

      if ($rootScope.loggedUser.role === 'doctor') {
      
          DoctorsFactory.getById( {id: $rootScope.loggedUser.id},
            function(response) {

              
              $scope.clinicsList = [];
              $scope.clinicsList=response.data.user.clinic;
            
            
      var filter = {"address":{"state_id":{"_id":$scope.selected.idState,"name":$scope.selected.nameState},
      "municipality_id":{"id":$scope.selected.municipalityId},"$":{"_id":$scope.selected.idLocality}}};
      $scope.clinicsList = $filter('filter')($scope.clinicsList, filter);
              $scope.itemsPerPage = 10;
              $scope.totalItems = response.data.user.clinic.length;

            },
            function(errorResponse) {
              $scope.error = "Registro con id=" + $routeParams.id + " no recuperado. " + (errorResponse.data.message || errorResponse.data);
            }
          );

      } else {

       // $scope.query.page = $scope.page;

        ClinicsFactory.get($scope.query,

          function(response) {
            if(response.success) {
              if (response.data.length === 0) {
                $scope.error = "No se encontraron coincidencias";
              }
              else {
                $scope.error = null;
              }
              $scope.clinicsList = response.data;
              
               var filter = {"address":{"state_id":{"_id":$scope.selected.idState,"name":$scope.selected.nameState},
               "municipality_id":{"id":$scope.selected.municipalityId},"$":{"_id":$scope.selected.idLocality}}};
                $scope.clinicsList = $filter('filter')($scope.clinicsList, filter);
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
    $scope.deleteConfirmation = function(ev, clinic) {

      if ($rootScope.loggedUser.role==='doctor') {
        $scope.error = "Usuario no autorizado para eliminar el registro.";
        return;
      }

      var confirm = $mdDialog.confirm()
      .title('¿Está seguro que desea eliminar la clínica seleccionada?')
      .textContent('Registro sanitario: ' + clinic.id)
      .ariaLabel('Lucky day')
      .targetEvent(ev)
      .ok('Eliminar')
      .cancel('Cancelar');

      $mdDialog.show(confirm).then(function() {
        $scope.clinicDelete(clinic);
      }, function() {
        return;
      });
    };

    // Service to delete the clinic object.
    $scope.clinicDelete = function (clinic) {

      ClinicsFactory.remove( {id: clinic._id},
        function(response) {
          if(response.success) {
            var index = $scope.clinicsList.indexOf(clinic);
            $scope.clinicsList.splice(index, 1);
          }
          else {
            console.log(response);
          }
        },
        function(errorResponse) {
          console.log(errorResponse);
        }
      );
    };

  }
]);

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


angular.module('clinics').factory('ClinicsFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/clinics', {}, {
      
      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      save: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      getById: {
        url: 'api/'+API_VERSION+'/clinics/:id',
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      update: {
        url: 'api/'+API_VERSION+'/clinics/:id',
        method:'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      remove: {
        url: 'api/'+API_VERSION+'/clinics/:id',
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
    });

  }
  
]);

angular.module('components').directive('uppercaseOnly', [
  // Dependencies

  // Directive
  function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ctrl) {
        /*
        element.on('keypress', function(e) {
          var char = e.char || String.fromCharCode(e.charCode);
          if (!/^[A-Z0-9]$/i.test(char)) {
            e.preventDefault();
            return false;
          }
        });
        */
        function parser(value) {
          if (ctrl.$isEmpty(value)) {
            return value;
          }
          var formatedValue = value.toUpperCase();
          if (ctrl.$viewValue !== formatedValue) {
            ctrl.$setViewValue(formatedValue);
            ctrl.$render();
          }
          return formatedValue;
        }

        function formatter(value) {
          if (ctrl.$isEmpty(value)) {
            return value;
          }
          return value.toUpperCase();
        }

        ctrl.$formatters.push(formatter);
        ctrl.$parsers.push(parser);
      }
    };
  }
]);
angular.module('configuration')
  .constant('AES_IV','passwordpassword')
  .constant('AES_KEY','passwordpassword');

angular.module('configuration').constant('API_VERSION','v1');


angular.module('doctors').config(['$routeProvider',

  function($routeProvider) {
    $routeProvider.
      when('/doctors', {
        templateUrl: 'doctors/views/doctors-list.client.view.html',
        controller: 'doctorsListController'
      }).
      when('/doctors/create', {
        templateUrl: 'doctors/views/doctors-create-update.client.view.html',
        controller: 'doctorsCreateController'
      }).
      when('/doctors/update/:id', {
        templateUrl: 'doctors/views/doctors-create-update.client.view.html',
        controller: 'doctorsUpdateController'
      });
  }

]);

angular.module('doctors').service('DoctorRoleService', [
  '$rootScope', 'jwtAuth', 'DoctorsFactory',
  function($rootScope, jwtAuth, DoctorsFactory) {

    this.load = function() {

      if (!$rootScope.loggedUser) {
        $rootScope.loggedUser = {};
        $rootScope.loggedUser = jwtAuth.isAuthed();
      }

      if ($rootScope.loggedUser.role === 'doctor') {

          DoctorsFactory.getById( {id: $rootScope.loggedUser.id},
            function(response) {

              $rootScope.loggedDoctor = {};
              $rootScope.loggedDoctor = response.data;

            },
            function(errorResponse) {
              $scope.error = "Registro con id=" + $routeParams.id + " no recuperado. " + (errorResponse.data.message || errorResponse.data);
            }
          );

      }

    }

  }
]);

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


angular.module('doctors').controller('doctorsListController', ['$rootScope',
  '$scope', '$filter','$location','MunicipalityFactory','LocalityFactory',
  'CountryFactory','DoctorsFactory', '$mdDialog','CatalogService',
  function($rootScope,$scope,$filter, $location,MunicipalityFactory,LocalityFactory,
    CountryFactory, DoctorsFactory, $mdDialog,CatalogService) {


      

        
      //variables de filtrado de estado, municipio y localidad   

      $scope.selected = { 
        state:'',
        idState:'',
        nameState:'',
        municipality:'',
        municipalityId:'',
        idLocality:''};

       

    // Load catalogs
    if (!$rootScope.catalog) {
      CatalogService.load();
    }

    //Load the Country
    CountryFactory.get(
      function(response) {
        if(response.success) {
          $rootScope.catalog.countries = response.data;
        } 
        else {
          console.log("Error to get countries not found");
        }
      },
      function(errorResponse) {
        console.log("ErrorResponse to get blood types not found");
      }
    );
//Load the Municipal
    $scope.searchMunicipalities = function(stado) {
      $scope.selected.idState=stado._id;
      $scope.selected.nameState=stado.name;
      $scope.getDoctors();
      MunicipalityFactory.get( {'id': stado._id},
        function(response) {
          if(response.success) {
            $rootScope.catalog.municipalityList = response.data;
          }
        }
      );
    };

    //Load the Localities
    $scope.searchLocalities = function(datos) {
      $scope.selected.municipalityId=datos._id;
      $scope.getDoctors();
      LocalityFactory.get( {'stateId': datos.state_id, 'municipalityId': datos.id},
        function(response) {
          if(response.success) {
            $scope.localityList = response.data;
         }
        }
      );
    };


    // Variable to select the nav icon
    $scope.menuSelected = function(menu){
      if(menu.path == "/doctors")
        menu.selected = true;
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
      $scope.selected = { 
        state:'',
        idState:'',
        nameState:'',
        municipality:'',
        municipalityId:'',
        idLocality:''};
      $scope.getDoctors();
    };

    // Load the doctors list without filtered
    $scope.getDoctors = function () {

      $scope.query.page = $scope.page;

      DoctorsFactory.get($scope.query,

        function(response) {
          if(response.success) {
            if (response.data.length === 0) {
              $scope.error = "No se encontraron coincidencias";
            }
            else {
              $scope.error = null;
            }
            $scope.doctorsList = response.data;
            var filter = {"user":{"$":{"state_id":{"_id":$scope.selected.idState,"name":$scope.selected.nameState},
              "municipality_id":$scope.selected.municipalityId,
              "locality_id":$scope.selected.idLocality}}};
            
            $scope.doctorsList = $filter('filter')($scope.doctorsList, filter);

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
    $scope.deleteConfirm = function(ev, doctor) {
      var confirm = $mdDialog.confirm()
      .title('¿Está seguro que desea eliminar al médico seleccionado?')
      .textContent('Nombre: ' + doctor.user.first_name + ' ' + doctor.user.father_surname + ' ' + doctor.user.mother_surname)
      .ariaLabel('Lucky day')
      .targetEvent(ev)
      .ok('Eliminar')
      .cancel('Cancelar');

      $mdDialog.show(confirm).then(function() {
        $scope.doctorDelete(doctor);
      }, function() {
        return;
      });
    };

    // Service to delete the doctor object.
    $scope.doctorDelete = function (doctor, index) {
      DoctorsFactory.remove( {id: doctor._id},
        function(response) {
          if(response.success) {
            var index = $scope.doctorsList.indexOf(doctor);
            $scope.doctorsList.splice(index, 1);
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


angular.module('doctors').factory('DoctorsFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/doctors', {}, {

      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      save: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      getById: {
        url: 'api/'+API_VERSION+'/doctors/:id',
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      update: {
        url: 'api/'+API_VERSION+'/doctors/:id',
        method:'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      remove: {
        url: 'api/'+API_VERSION+'/doctors/:id',
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);
// Configure the 'admins' module routes
angular.module('index').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
          templateUrl: 'index/views/index.client.view.html'
        }).

        otherwise({
          redirectTo: '/'
        });
    }
]);


angular.module('index').controller('IndexController', [
  '$rootScope', '$scope', 'DoctorRoleService', 'CatalogService',
  function($rootScope, $scope, DoctorRoleService, CatalogService) {

    // Load catalogs in the $rootScope
    if (!$rootScope.catalog) {
      CatalogService.load();
    }

    // Load catalogs in the doctorRole
    if (!$rootScope.loggedDoctor) {
      DoctorRoleService.load();
    }

  }
]);
// Configure the 'admins' module routes
angular.module('login').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/login', {
      templateUrl: 'login/views/login.client.view.html'
    }).
    when('/reset', {
      templateUrl: 'login/views/reset.client.view.html'
    }).
    when('/activate', {
      templateUrl: 'login/views/activate.client.view.html'
    }).
    when('/activate/:url_activate', {
      templateUrl: 'login/views/activate.client.view.html'
    }).
    when('/reset/:url_token', {
      templateUrl: 'login/views/reset.client.view.html'
    });
  }
]);

angular.module('login').controller('LoginController', [
  '$scope','$routeParams', '$location',
  'Login', 'Recovery', 'Reset',
  'Tools', 'jwtAuth', 'AES_IV', 'AES_KEY',
  function($scope, $routeParams, $location,
    Login, Recovery, Reset,
    Tools, jwtAuth, AES_IV, AES_KEY){

    $scope.loggedUser = {};
    $scope.recoveryView = false;

    $scope.isAuthed = function(){
      $scope.loggedUser = jwtAuth.isAuthed();
      if ($scope.loggedUser.isAuthed) {
        $location.path('/');
      }
    };

    $scope.isAuthed();
    $scope.loginButtonDisabled = false;

    $scope.login = function() {

      $scope.loginButtonDisabled = true;
      $scope.error = null;

      var user = new Login({
        email: this.username,
        password: jwtAuth.encode(this.password)
      });

      user.$post(
        function(response) {
          $scope.loginButtonDisabled = false;

          if (response.success) {

            if (jwtAuth.parseJwt(response.data.token).role === 'tutor') {
              $scope.error = "Acceso restringido";
              return;
            }

            var token = response.data.token;
            jwtAuth.saveToken(token);
            $location.path('/');

          } else {
            $scope.error = response.message;
          }
        },
        function(errorResponse) {
          $scope.error = errorResponse.data.message;
        }
      );

    };

    $scope.recoveryButtonDisabled = false;
    $scope.recovery = function() {
      $scope.error = null;
      $scope.recoveryButtonDisabled = true;
      var recovery = new Recovery({
        email: this.username
      });
      recovery.$post(
        function(response) {
          $scope.recoveryButtonDisabled = false;
          $scope.error = response.message;
        },
        function(errorResponse) {
          $scope.error = errorResponse.data.message;
        }
      );
    };


    $scope.getUrlToken = function(){
      console.log($routeParams.url_token);
    };

    $scope.resetButtonDisabled = false;

    $scope.reset = function() {
      $scope.error = null;
      if (this.password != this.passwordC) {
        $scope.error = "Las contraseñas no coinciden";
        return;
      }
      $scope.resetButtonDisabled = true;

      var reset = new Reset({
        password: jwtAuth.encode(this.password),
        url_token: $routeParams.url_token,
      });

      reset.$post(
        function(response) {
          $scope.resetButtonDisabled = false;
          if (response.success) {
            $location.path('/login');
          } else {
            $scope.error = response.message;
          }
        },
        function(errorResponse) {
          $scope.resetButtonDisabled = false;
          $scope.error = errorResponse.data.message;
        }
      );
    };

  }
]);

angular.module('login').factory('Login',['$resource',
  'API_VERSION',
  function($resource,
    API_VERSION){
    return $resource('api/'+API_VERSION+'/users/login',{},
      {
        post:{
          method:"POST",
          headers:  {
            'x-access-token':window.localStorage.jwtToken
          }
        }
      }
    );
  }
]);

angular.module('login').factory('Recovery',['$resource',
  'API_VERSION',
  function($resource,
    API_VERSION){
    return $resource('api/'+API_VERSION+'/users/recoverPassword',{},
      {
        post:{
          method:"POST",
          headers:  {
            'x-access-token':window.localStorage.jwtToken
          }
        }
      }
    );
  }
]);

angular.module('login').factory('Reset',['$resource',
  'API_VERSION',
  function($resource,
    API_VERSION){
    return $resource('api/'+API_VERSION+'/users/restorePassword',{},
      {
        post:{
          method:"POST",
          headers:  {
            'x-access-token':window.localStorage.jwtToken
          }
        }
      }
    );
  }
]);


angular.module('patients').config(['$routeProvider',

  function($routeProvider) {
    $routeProvider.
      when('/patients', {
        templateUrl: 'patients/views/patients-list.client.view.html',
        controller: 'patientsListController'
      }).
      when('/patients/create', {
        templateUrl: 'patients/views/patients-create-update.client.view.html',
        controller: 'patientsCreateController'
      }).
      when('/patients/update/:id', {
        templateUrl: 'patients/views/patients-create-update.client.view.html',
        controller: 'patientsUpdateController'
      });
  }

]);


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

angular.module('patients').controller('patientsListController', [
  '$rootScope', '$scope', '$filter','$location', '$mdDialog','MunicipalityFactory','LocalityFactory','CountryFactory','CatalogService',
  'PatientsFactory',
  function($rootScope, $scope, $filter,$location, $mdDialog,
    MunicipalityFactory,LocalityFactory,CountryFactory,CatalogService,PatientsFactory) {
     //variables de filtrado de estado, municipio y localidad   

     $scope.selected = { 
      state:'',
      idState:'',
      nameState:'',
      municipality:'',
      municipalityId:'',
      idLocality:''};

     

  // Load catalogs
  if (!$rootScope.catalog) {
    CatalogService.load();
  }

  //Load the Country
  CountryFactory.get(
    function(response) {
      if(response.success) {
        $rootScope.catalog.countries = response.data;
      } 
      else {
        console.log("Error to get countries not found");
      }
    },
    function(errorResponse) {
      console.log("ErrorResponse to get blood types not found");
    }
  );
//Load the Municipal
  $scope.searchMunicipalities = function(stado) {
    $scope.selected.idState=stado._id;
    $scope.selected.nameState=stado.name;
    $scope.getPatients();
    MunicipalityFactory.get( {'id': stado._id},
      function(response) {
        if(response.success) {
          $rootScope.catalog.municipalityList = response.data;
        }
      }
    );
  };

  //Load the Localities
  $scope.searchLocalities = function(datos) {
    $scope.selected.municipalityId=datos._id;
    $scope.getPatients();
    LocalityFactory.get( {'stateId': datos.state_id, 'municipalityId': datos.id},
      function(response) {
        if(response.success) {
          $scope.localityList = response.data;
       }
      }
    );
  };

    // Variable to select the nav icon
    $scope.menuSelected = function(menu){
      if(menu.path == "/patients")
        menu.selected = true;
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
      $scope.selected = { 
        state:'',
        idState:'',
        nameState:'',
        municipality:'',
        municipalityId:'',
        idLocality:''};
      $scope.getPatients();
    };

    // Load the patient list without filtered
    $scope.getPatients = function () {

      $scope.query.page = $scope.page;

      PatientsFactory.get($scope.query,

        function(response) {
          if(response.success) {
            if (response.data.length === 0) {
              $scope.error = "No se encontraron coincidencias";
            }
            else {
              $scope.error = null;
            }
            $scope.patientsList = response.data;
            var filter = {"$":$scope.query.father_surname,
              "$":{"state_id":{"_id":$scope.selected.idState,"name":$scope.selected.nameState},
              "municipality_id":$scope.selected.municipalityId,
              "locality_id":$scope.selected.idLocality}};
            
            $scope.patientsList = $filter('filter')($scope.patientsList, filter);

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
    $scope.deleteConfirm = function(ev, patient) {

      if ($rootScope.loggedUser.role==='doctor') {
        $scope.error = "Usuario no autorizado para eliminar el registro.";
        return;
      }

      var confirm = $mdDialog.confirm()
      .title('¿Está seguro que desea eliminar el paciente seleccionado?')
      .textContent('Nombre: ' + patient.first_name + ' ' + patient.father_surname + ' ' + patient.mother_surname)
      .ariaLabel('Lucky day')
      .targetEvent(ev)
      .ok('Eliminar')
      .cancel('Cancelar');

      $mdDialog.show(confirm).then(function() {
        $scope.patientDelete(patient);
      }, function() {
        return;
      });
    };

    // Service to delete the patient object.
    $scope.patientDelete = function (patient, index) {
      PatientsFactory.remove( {id: patient._id},
        function(response) {
          if(response.success) {
            var index = $scope.patientsList.indexOf(patient);
            $scope.patientsList.splice(index, 1);
          }
          else {
            $scope.error = response.message;
          }
        },
        function(errorResponse) {
          $scope.error = "Registro no actualizado. " +(errorResponse.data.message || errorResponse.data);
        }
      );
    };

  }
]);


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
                    console.log('doctorupdateResponse', response)

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

          console.log('get_patient', response);

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
        console.log($scope.patientForm);
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
        'dose'             : dosage.vaccine.dose + 'ml - ',
        'doctor'           : doctors.user.curp,
      };

      if (doctors.user.clinic.length === 0) {
        self.vaccineError = 'El doctor selelccionado no tiene alguna clínica asignada.';
        return;
      }

      // var to send the information to add the vaccine in the patient.
      $scope.vaccineControl = angular.copy(self.vaccineControlData);

      console.log(self.vaccineControlData.application_date);

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

angular.module('patients').factory('CevFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/users/cev2', {}, {
      getPatient: {
        method:'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);

angular.module('patients').factory('PatientsFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/patients', {}, {

      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      save: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      getById: {
        url: 'api/'+API_VERSION+'/patients/:id',
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      update: {
        url: 'api/'+API_VERSION+'/patients/:id',
        method:'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      remove: {
        url: 'api/'+API_VERSION+'/patients/:id',
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);

angular.module('patients').factory('VaccinesFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/vaccinesControls', {}, {
      save: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      getPatientVaccines: {
        url: 'api/'+API_VERSION+'/vaccinesControls/patient/:id',
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);

angular.module('tools').service('curp', [
  function() {

    /**
    * Elimina los acentos, eñes y diéresis que pudiera tener el nombre.
    * @param {string} str - String con el nombre o los apellidos.
    */
    function normalizeString(str) {
      var chars_1, chars_2, result;
      chars_1  = [ 'Ã', 'À', 'Á', 'Ä', 'Â', 'È', 'É', 'Ë', 'Ê', 'Ì', 'Í', 'Ï', 'Î',
               'Ò', 'Ó', 'Ö', 'Ô', 'Ù', 'Ú', 'Ü', 'Û', 'ã', 'à', 'á', 'ä', 'â',
               'è', 'é', 'ë', 'ê', 'ì', 'í', 'ï', 'î', 'ò', 'ó', 'ö', 'ô', 'ù',
               'ú', 'ü', 'û', 'Ç', 'ç' ];
      
      chars_2 = [ 'A', 'A', 'A', 'A', 'A', 'E', 'E', 'E', 'E', 'I', 'I', 'I', 'I',
               'O', 'O', 'O', 'O', 'U', 'U', 'U', 'U', 'a', 'a', 'a', 'a', 'a',
               'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'o', 'o', 'o', 'o', 'u',
               'u', 'u', 'u', 'c', 'c' ];

      str = str.toUpperCase().trim()
      str = str.split('');

      result = str.map(function (char) {
        var pos = chars_1.indexOf(char);
        return (pos > -1) ? chars_2[pos] : char;
      });

      return result.join('');
    }

    /**
    * Elimina proposiciones, contracciones o conjunciones.
    * @param {string} str - String que representa apellido.
    */
    function cleanString(str) {
      str = normalizeString(str)

      var compounds = [ /\bDA\b/, /\bDAS\b/, /\bDE\b/, /\bDEL\b/, /\bDER\b/, /\bDI\b/,
          /\bDIE\b/, /\bDD\b/, /\bEL\b/, /\bLA\b/, /\bLOS\b/, /\bLAS\b/, /\bLE\b/,
          /\bLES\b/, /\bMAC\b/, /\bMC\b/, /\bVAN\b/, /\bVON\b/, /\bY\b/ ];

      compounds.forEach(function (compound) {
        if (compound.test(str)) {
          str = str.replace(compound, '');
        }
      });

      return str;
    }

    /**
    * Obtiene la letra inicial del apellido paterno.
    * Si la letra es una Ñ la sustituye por X.
    * @param {string} surname - String que representa apellido.
    */
    function getFirstSurnameLetter(surname) {
      var FirtsSurnameLetter;

      if (!surname || surname === "") {
        FirtsSurnameLetter = 'X';
      } else {
        FirtsSurnameLetter = surname.substring(0, 1);
        FirtsSurnameLetter = FirtsSurnameLetter === 'Ñ' ? 'X' : FirtsSurnameLetter;
      }
      
      return FirtsSurnameLetter;
    }

    /**
    * Obtiene la letra vocal del apellido paterno a partir del segundo caracter. * Si no existe la vocal ingresa X.
    * @param {string} surname - String que representa apellido.
    */
    function getFirstSurnameVowel(surname) {
      var firstVowel = surname.substring(1).replace(/[BCDFGHJKLMNÑPQRSTVWXYZ]/g, '').substring(0, 1);
      firstVowel = (firstVowel === '') ? 'X' : firstVowel;
      return firstVowel;
    }

    /**
    * Estrae la inicial del primer nombre.
    * Si tiene nombres comunes obtine la inicial del segundo nombre.
    * @param {string} names - String que representa los nombres.
    */
    function getFirstNameLetter(names) {
      var names, isCommonName;
      var commons = [ 'MARIA', 'MA', 'MA.', 'JOSE', 'J', 'J.' ];

      names = names.split(/\s+/);
      isCommonName = (names.length > 1 && commons.indexOf(names[0]) > -1);

      if (isCommonName) {
        return names[1].substring(0, 1);
      } 
      else {
        return names[0].substring(0, 1);
      }
    }

    /**
    * Filtra palabras altisonantes en los primeros 4 caracteres del CURP
    * @param {string} str - Los primeros 4 caracteres del CURP
    */
    function filterBadWords(str) {
      var inconvenientes = [ 'BACA', 'LOCO', 'BUEI', 'BUEY', 'MAME', 'CACA', 'MAMO',
        'CACO', 'MEAR', 'CAGA', 'MEAS', 'CAGO', 'MEON', 'CAKA', 'MIAR', 'CAKO', 'MION',
        'COGE', 'MOCO', 'COGI', 'MOKO', 'COJA', 'MULA', 'COJE', 'MULO', 'COJI', 'NACA',
        'COJO', 'NACO', 'COLA', 'PEDA', 'CULO', 'PEDO', 'FALO', 'PENE', 'FETO', 'PIPI',
        'GETA', 'PITO', 'GUEI', 'POPO', 'GUEY', 'PUTA', 'JETA', 'PUTO', 'JOTO', 'QULO',
        'KACA', 'RATA', 'KACO', 'ROBA', 'KAGA', 'ROBE', 'KAGO', 'ROBO', 'KAKA', 'RUIN',
        'KAKO', 'SENO', 'KOGE', 'TETA', 'KOGI', 'VACA', 'KOJA', 'VAGA', 'KOJE', 'VAGO',
        'KOJI', 'VAKA', 'KOJO', 'VUEI', 'KOLA', 'VUEY', 'KULO', 'WUEI', 'LILO', 'WUEY',
        'LOCA' ];

      if (inconvenientes.indexOf(str) > -1) {
        str = str.replace(/^(\w)\w/, '$1X');
      }

      return str;
    }

    /**
    * Estrae los seis números de la fecha de nacimiento.
    * @param {string} birthdate - String que representa fecha de nacimiento con formato dd/mm/yyyy.
    */
    function getBirthdate(birthdate) {
      birthdate = birthdate.split('/');
      birthdate[0] = birthdate[0].substring(2,4);
      return birthdate.join('');
    }

    /**
    * Obtiene primer letra del sexo.
    * @param {string} gender - String con valor de MASCULINO ó FEMENINO.
    */
    function getFirstGenderLetter(gender) {
      var firstLetter = gender.trim().toUpperCase().substring(0, 1);

      return firstLetter;
    }

    /**
    * Obtiene siguente consonante después del primer caracter del string.
    * Si no hay una consonante devuelve X.
    * @param {string} name - String del cual se va a sacar la primer consonante.
    */
    function getNextConsonant(name) {
      var isCommonName;
      var commons = [ 'MARIA', 'MA', 'MA.', 'JOSE', 'J', 'J.' ];

      name = name.split(/\s+/);
      isCommonName = (name.length > 1 && commons.indexOf(name[0]) > -1);

      if (isCommonName) {
        name = name[1];
      } 
      else {
        name = name[0];
      }

      var nextConsonant = name.substring(1).replace(/[AEIOU]/ig, '').substring(0, 1);
      return (nextConsonant === '' || nextConsonant === 'Ñ') ? 'X' : nextConsonant;
    }


    /**
    * Agdd the verification digit to the curp.
    * @param {string} name - String with the 17 curp digits.
    */
    function addVerifyDigit(curp_str) {
      var curp, caracteres, numericCurp, sum, digito;

      caracteres  = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E',
        'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S',
        'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
      ];

      // Convierte el curp a un arreglo de números, usando la posición de cada
      // carácter, dentro del arreglo `caracteres`.
      numericCurp = curp.map(function (caracter) {
        return caracteres.indexOf(caracter);
      });

      sum = numericCurp.reduce(function (prev, valor, indice) {
        return prev + (valor * (18 - indice));
      }, 0);

      digito = (10 - (sum % 10));

      if (digito === 10) {
        digito = 0;
      }

      return curp_str + digito;
    }

    this.generate = function(param) {
    /**
      var curp = curp.generate({
        nombre            : 'María del Rosario',
        apellido_paterno  : 'Gomez',
        apellido_materno  : 'Juárez',
        sexo              : 'MASCULINO',
        estado            : 'DF',
        fecha_nacimiento  : 01/12/1988
      });
    */
      var curp = [];

      param.first_name     = cleanString(param.first_name);
      param.father_surname = cleanString(param.father_surname);
      param.mother_surname = cleanString(param.mother_surname);


      var name_chars = [
        getFirstSurnameLetter(param.father_surname),
        getFirstSurnameVowel(param.father_surname),
        getFirstSurnameLetter(param.mother_surname),
        getFirstNameLetter(param.first_name)
      ].join('');

      name_chars = filterBadWords(name_chars)

      curp = [
        name_chars, 
        getBirthdate(param.birthdate),
        getFirstGenderLetter(param.gender),
        param.state_code.trim().toUpperCase(),
        getNextConsonant(param.father_surname),
        getNextConsonant(param.mother_surname),
        getNextConsonant(param.first_name),
        // param.homonimia || ( parseInt(param.birthdate.substring(6), 10) > 1999 ? 'A' : 0 )
      ].join('');

      return curp;
    };
  }

]);

angular.module('tools').service('jwtAuth', [  '$base64', 'AES_IV', 'AES_KEY',
  function($base64, AES_IV, AES_KEY) {
    var _this = this;

    _this.saveToken = function(token){
      window.localStorage.jwtToken = token;
      //console.log("New token: "+window.localStorage.jwtToken);
    };
    _this.getToken = function() {
      // console.log("Retrive token: "+window.localStorage.jwtToken);
      return window.localStorage.jwtToken;
    };
    _this.logout = function() {
      window.localStorage.removeItem('jwtToken');
      window.localStorage.clear();
    };
    _this.isAuthed = function() {
      var token = _this.getToken();
      if(token) {
        var params = _this.parseJwt(token);
        // params.exp is no defined
        // params.isAuthed = Math.round(new Date().getTime() / 1000) <= params.exp;
        params.isAuthed = true;
        return params;
      } else {
        return false;
      }
    };
    _this.parseJwt = function(token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(window.atob(base64));
    };
    _this.encode = function(pass) {
      var cipher = forge.cipher.createCipher('AES-CBC', AES_KEY);
      cipher.start({iv: AES_IV});
      cipher.update(forge.util.createBuffer(pass));
      cipher.finish();
      return $base64.encode(cipher.output.data);
    };
  }

]);

angular.module('tools').service('Tools', [
  function() {
    var _this = this;

    _this.validDate = function(dateString) {
      // if(!/^\d{4}-\d{1,2}-\d{1,2}\$/.test(dateString))
      //   return false;
      var parts = dateString.split("-");
      var day = parseInt(parts[2], 10);
      var month = parseInt(parts[1], 10);
      var year = parseInt(parts[0], 10);
      if(year < 1000 || year > 3000 || month === 0 || month > 12)
        return false;
      var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
      if(year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
        monthLength[1] = 29;
      return day > 0 && day <= monthLength[month - 1];
    };

    // "what?" version ... http://jsperf.com/diacritics/12
    _this.removeDiacritics = function(str) {
      var diacriticsMap = {};
      for (var i=0; i < defaultDiacriticsRemovalMap .length; i++){
          var letters = defaultDiacriticsRemovalMap [i].letters;
          for (var j=0; j < letters.length ; j++){
              diacriticsMap[letters[j]] = defaultDiacriticsRemovalMap [i].base;
          }
      }
      return str.replace(/[^\u0000-\u007E]/g, function(a){
         return diacriticsMap[a] || a;
      });
    };    
    var defaultDiacriticsRemovalMap = [
        {'base':'A', 'letters':'\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F'},
        {'base':'AA','letters':'\uA732'},
        {'base':'AE','letters':'\u00C6\u01FC\u01E2'},
        {'base':'AO','letters':'\uA734'},
        {'base':'AU','letters':'\uA736'},
        {'base':'AV','letters':'\uA738\uA73A'},
        {'base':'AY','letters':'\uA73C'},
        {'base':'B', 'letters':'\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181'},
        {'base':'C', 'letters':'\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E'},
        {'base':'D', 'letters':'\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779'},
        {'base':'DZ','letters':'\u01F1\u01C4'},
        {'base':'Dz','letters':'\u01F2\u01C5'},
        {'base':'E', 'letters':'\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E'},
        {'base':'F', 'letters':'\u0046\u24BB\uFF26\u1E1E\u0191\uA77B'},
        {'base':'G', 'letters':'\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E'},
        {'base':'H', 'letters':'\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D'},
        {'base':'I', 'letters':'\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197'},
        {'base':'J', 'letters':'\u004A\u24BF\uFF2A\u0134\u0248'},
        {'base':'K', 'letters':'\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2'},
        {'base':'L', 'letters':'\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780'},
        {'base':'LJ','letters':'\u01C7'},
        {'base':'Lj','letters':'\u01C8'},
        {'base':'M', 'letters':'\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C'},
        {'base':'N', 'letters':'\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4'},
        {'base':'NJ','letters':'\u01CA'},
        {'base':'Nj','letters':'\u01CB'},
        {'base':'O', 'letters':'\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C'},
        {'base':'OI','letters':'\u01A2'},
        {'base':'OO','letters':'\uA74E'},
        {'base':'OU','letters':'\u0222'},
        {'base':'OE','letters':'\u008C\u0152'},
        {'base':'oe','letters':'\u009C\u0153'},
        {'base':'P', 'letters':'\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754'},
        {'base':'Q', 'letters':'\u0051\u24C6\uFF31\uA756\uA758\u024A'},
        {'base':'R', 'letters':'\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782'},
        {'base':'S', 'letters':'\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784'},
        {'base':'T', 'letters':'\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786'},
        {'base':'TZ','letters':'\uA728'},
        {'base':'U', 'letters':'\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244'},
        {'base':'V', 'letters':'\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245'},
        {'base':'VY','letters':'\uA760'},
        {'base':'W', 'letters':'\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72'},
        {'base':'X', 'letters':'\u0058\u24CD\uFF38\u1E8A\u1E8C'},
        {'base':'Y', 'letters':'\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE'},
        {'base':'Z', 'letters':'\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762'},
        {'base':'a', 'letters':'\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'},
        {'base':'aa','letters':'\uA733'},
        {'base':'ae','letters':'\u00E6\u01FD\u01E3'},
        {'base':'ao','letters':'\uA735'},
        {'base':'au','letters':'\uA737'},
        {'base':'av','letters':'\uA739\uA73B'},
        {'base':'ay','letters':'\uA73D'},
        {'base':'b', 'letters':'\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253'},
        {'base':'c', 'letters':'\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184'},
        {'base':'d', 'letters':'\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A'},
        {'base':'dz','letters':'\u01F3\u01C6'},
        {'base':'e', 'letters':'\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'},
        {'base':'f', 'letters':'\u0066\u24D5\uFF46\u1E1F\u0192\uA77C'},
        {'base':'g', 'letters':'\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F'},
        {'base':'h', 'letters':'\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265'},
        {'base':'hv','letters':'\u0195'},
        {'base':'i', 'letters':'\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'},
        {'base':'j', 'letters':'\u006A\u24D9\uFF4A\u0135\u01F0\u0249'},
        {'base':'k', 'letters':'\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3'},
        {'base':'l', 'letters':'\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747'},
        {'base':'lj','letters':'\u01C9'},
        {'base':'m', 'letters':'\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F'},
        {'base':'n', 'letters':'\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5'},
        {'base':'nj','letters':'\u01CC'},
        {'base':'o', 'letters':'\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'},
        {'base':'oi','letters':'\u01A3'},
        {'base':'ou','letters':'\u0223'},
        {'base':'oo','letters':'\uA74F'},
        {'base':'p','letters':'\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755'},
        {'base':'q','letters':'\u0071\u24E0\uFF51\u024B\uA757\uA759'},
        {'base':'r','letters':'\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783'},
        {'base':'s','letters':'\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B'},
        {'base':'t','letters':'\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787'},
        {'base':'tz','letters':'\uA729'},
        {'base':'u','letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'},
        {'base':'v','letters':'\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C'},
        {'base':'vy','letters':'\uA761'},
        {'base':'w','letters':'\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73'},
        {'base':'x','letters':'\u0078\u24E7\uFF58\u1E8B\u1E8D'},
        {'base':'y','letters':'\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF'},
        {'base':'z','letters':'\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763'}
    ];

  }

]);


angular.module('tutors').config(['$routeProvider',

  function($routeProvider) {
    $routeProvider.
      when('/tutors', {
        templateUrl: 'tutors/views/tutors-list.client.view.html',
        controller: 'tutorsListController'
      }).
      when('/tutors/create', {
        templateUrl: 'tutors/views/tutors-create-update.client.view.html',
        controller: 'tutorsCreateController'
      }).
      when('/tutors/update/:id', {
        templateUrl: 'tutors/views/tutors-create-update.client.view.html',
        controller: 'tutorsUpdateController'
      });
  }

]);


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

angular.module('tutors').controller('tutorsListController', [
  '$rootScope', '$scope','$location', 'TutorsFactory', '$mdDialog', '$filter', 
  'DoctorsFactory','MunicipalityFactory','LocalityFactory','CountryFactory', 'jwtAuth','CatalogService',
  function($rootScope, $scope,$location, TutorsFactory, $mdDialog, $filter,
   DoctorsFactory,MunicipalityFactory,LocalityFactory,CountryFactory,jwtAuth,CatalogService) {

        
      //variables de filtrado de estado, municipio y localidad   

      $scope.selected = { 
        state:'',
        idState:'',
        nameState:'',
        municipality:'',
        municipalityId:'',
        idLocality:''};

       

    // Load catalogs
    if (!$rootScope.catalog) {
      CatalogService.load();
    }

    //Load the Country
    CountryFactory.get(
      function(response) {
        if(response.success) {
          $rootScope.catalog.countries = response.data;
        } 
        else {
          console.log("Error to get countries not found");
        }
      },
      function(errorResponse) {
        console.log("ErrorResponse to get blood types not found");
      }
    );
//Load the Municipal
    $scope.searchMunicipalities = function(stado) {
      $scope.selected.idState=stado._id;
      $scope.selected.nameState=stado.name;
      $scope.getTutors();
      console.log("controller---->>>>> searchMunicipalities");
      MunicipalityFactory.get( {'id': stado._id},
        function(response) {
          console.log("clinicsCreateController---->>>>> searchMunicipalities");
          if(response.success) {
            $rootScope.catalog.municipalityList = response.data;
          }
        }
      );
    };

    //Load the Localities
    $scope.searchLocalities = function(datos) {
      $scope.selected.municipalityId=datos._id;
      $scope.getTutors();
      LocalityFactory.get( {'stateId': datos.state_id, 'municipalityId': datos.id},
        function(response) {
          if(response.success) {
            $scope.localityList = response.data;
         }
        }
      );
    };


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
      $scope.selected = { 
        state:'',
        idState:'',
        nameState:'',
        municipality:'',
        municipalityId:'',
        idLocality:''};
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
              var filter={"$":{"first_name":$scope.query.first_name,
              "father_surname":$scope.query.father_surname,
                "mother_surname":$scope.query.mother_surname,
                "$":{"state_id":{"_id":$scope.selected.idState,"name":$scope.selected.nameState},
                "municipality_id":$scope.selected.municipalityId,
                  "locality_id":$scope.selected.idLocality}}};
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
              var filter={"$":{"first_name":$scope.query.first_name,
              "father_surname":$scope.query.father_surname,
                "mother_surname":$scope.query.mother_surname,
                "$":{"state_id":{"_id":$scope.selected.idState,"name":$scope.selected.nameState},
                "municipality_id":$scope.selected.municipalityId,
                  "locality_id":$scope.selected.idLocality}}};
                  $scope.tutorsList = $filter('filter')($scope.tutorsList, filter);
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
      console.log(JSON.stringify(tutorsFactory));
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

angular.module('tutors').factory('TutorsFactory', ['$resource', 'API_VERSION', 'jwtAuth',
  
  function($resource, API_VERSION, jwtAuth) {
    
    return $resource('api/'+API_VERSION+'/tutors', {}, {

      get: {
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      save: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      getById: {
        url: 'api/'+API_VERSION+'/tutors/:id',
        method:'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      update: {
        url: 'api/'+API_VERSION+'/tutors/:id',
        method:'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      },
      remove: {
        url: 'api/'+API_VERSION+'/tutors/:id',
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': jwtAuth.getToken()
        }
      }

    });

  }
  
]);
// Configure the 'admins' module routes
angular.module('vaccines').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/vaccines', {
          templateUrl: 'vaccines/views/vaccines.client.view.html'
        }).
        when('/vaccines/create', {
          templateUrl: 'vaccines/views/vaccines-create.client.view.html'
        });
    }
]);

angular.module('vaccines').controller('VaccinesController', [
  '$scope','$routeParams', '$location',
  'Tools','Upload',
  'Vaccines','AdministrationRoutes',
  '$mdDialog',
  function($scope, $routeParams, $location,
  Tools,Upload,
  Model,AdministrationRoutes,
  $mdDialog){
    $scope.genderArray = [
      "Mujeres",
      "Hombres"
    ];

    $scope.error = "";
    $scope.picture64 = false;

    var errorResponse = function(errorResponse){
      console.log(errorResponse);
      if (errorResponse.status !== -1){
        $scope.error = "* " +
          (errorResponse.data.message ||
            errorResponse.data);
      } else {
        $scope.error = "* Error: revise su conexión a internet.";
      }
    };

    $scope.readAllVaccines = function(){
      Model.get(
        function(response) {
          if (response.success) {
            $scope.vaccinesList = response.data;
          } else {
            $scope.error = "* " + response.msg;
          }
        },
        errorResponse
      );
    };
    $scope.readAllAdministrationRoutes = function(){
      AdministrationRoutes.get(
        function(response) {
          if (response.success) {
            $scope.administrationRoutes = response.data;
          } else {
            $scope.error = "* " + (response.msg || response.message);
          }
        },
        errorResponse
      );
    };

    $scope.submit = function(){
      var picture;
      if (this.picture) {
        picture = {
          file: $scope.picture64,
          name: this.picture[0].name
        };
      }
      var vaccine = new Model({
        id:                   $scope.id,
        name:                 $scope.name,
        previous_vaccine:     $scope.previousVaccine,
        administration_route: $scope.administrationRoute,
        dose:                 $scope.dose,
        gender:               $scope.gender,
        picture:              picture || undefined
      });
      vaccine.$save(
        function(response) {
          if (response.success) {
            $location.path("vaccines/");
          } else {
            $scope.error = "* " + response.msg;
          }
        },
        errorResponse
      );
    };

    $scope.deleteConfirmation = function(ev,index) {
      var item = this.item;
      var confirm = $mdDialog.confirm()
          .title('¿Esta seguro que desea eliminar este registro?')
          .textContent('Si elimina este registro, ya no estará disponible ' +
                        'para otros usuarios')
          .ariaLabel('Eliminar registro')
          .targetEvent(ev)
          .ok('Eliminar')
          .cancel('Cancelar');
      $mdDialog.show(confirm).then(function() {
        $scope.delete(index,item);
      }, function() {
        return;
      });
    };

    $scope.delete = function(index,item){
      this.item = Model.remove({
          vaccinesId: item._id
        },
        function(response){
          if (response.success) {
            $scope.vaccinesList.splice(index, 1);
          } else {
            $scope.error = response.msg;
          }
        },
        function(errorResponse){
          console.log(errorResponse);
          $scope.error = errorResponse.data.msg;
        }
      );
    };

    $scope.onChangePicture = function(){
      var reader = new FileReader();
      reader.onload = $scope.loadRenderPicture;
      if (this.picture[0]) {
        reader.readAsDataURL(this.picture[0]);
      }
    };
    $scope.loadRenderPicture = function(e){
      $scope.picture64 = e.target.result;
      document.getElementById("picture-preview")
        .style.background = "url("+e.target.result+")";
    };

    $scope.menuSelected = function(menu){
      if (menu.path == "/vaccines") {
        menu.selected = true;
      }
    };

  }
]);

  angular.module('vaccines').factory('AdministrationRoutes',['$resource',
  'API_VERSION','jwtAuth',
  function($resource,
    API_VERSION,jwtAuth){
    return $resource('api/'+API_VERSION+'/administrationRoutes/',{},
      {
        get:{
          method:"GET",
          headers:  {
            'x-access-token':jwtAuth.getToken()
          }
        },
        post:{
          method:"POST",
          headers:  {
            'x-access-token':jwtAuth.getToken()
          }
        }
      }
    );
  }
]);

angular.module('vaccines').factory('Vaccines',['$resource',
  'API_VERSION','jwtAuth',
  function($resource,
    API_VERSION,jwtAuth){
    return $resource('api/'+API_VERSION+'/vaccines/:vaccinesId',{
        vaccinesId: '@_id'
      },
      {
        remove:{
          method:"DELETE",
          headers:  {
            'x-access-token':jwtAuth.getToken()
          }
        },
        get:{
          method:"GET",
          headers:  {
            'x-access-token':jwtAuth.getToken()
          }
        },
        save:{
          method:"POST",
          headers:  {
            'x-access-token':jwtAuth.getToken()
          }
        }
      }
    );
  }
]);

  
  angular.module('vaccines').factory('VaccinesControlFactory',['$resource',
  'API_VERSION','jwtAuth',
  function($resource,
    API_VERSION,jwtAuth){
    return $resource('api/'+API_VERSION+'/vaccinesControls/',{},
      {
        get:{
          method:"GET",
          headers:  {
            'x-access-token':jwtAuth.getToken()
          }
        },
        post:{
          method:"POST",
          headers:  {
            'x-access-token':jwtAuth.getToken()
          }
        }
      }
    );
  }
]);
