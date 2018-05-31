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
