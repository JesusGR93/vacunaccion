
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