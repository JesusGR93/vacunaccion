
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