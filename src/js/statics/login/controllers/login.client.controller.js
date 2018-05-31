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
