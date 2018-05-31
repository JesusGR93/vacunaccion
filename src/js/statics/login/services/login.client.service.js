angular.module('login').factory('Login',['$resource',
  'API_VERSION',
  function($resource,
    API_VERSION){
    return $resource('api/'+API_VERSION+'/users/login',{},
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
