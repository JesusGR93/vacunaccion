
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
