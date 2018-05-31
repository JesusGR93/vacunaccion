
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