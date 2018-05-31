angular.module('login').factory('Reset',['$resource',
  'API_VERSION',
  function($resource,
    API_VERSION){
    return $resource('api/'+API_VERSION+'/users/restorePassword',{},
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
