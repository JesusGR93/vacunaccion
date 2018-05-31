
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