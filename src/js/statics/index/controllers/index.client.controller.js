
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