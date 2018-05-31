
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
