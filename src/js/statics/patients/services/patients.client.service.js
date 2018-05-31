
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