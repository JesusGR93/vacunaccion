angular.module('login').factory('Recovery',['$resource',
  'API_VERSION',
  function($resource,
    API_VERSION){
    return $resource('api/'+API_VERSION+'/users/recoverPassword',{},
      {
        post:{
          method:"POST",
          headers:  {
            'x-access-token':window.localStorage.jwtToken
          }
        }
      }
    );
  }
]);
