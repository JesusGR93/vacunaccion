  
  angular.module('vaccines').factory('VaccinesControlFactory',['$resource',
  'API_VERSION','jwtAuth',
  function($resource,
    API_VERSION,jwtAuth){
    return $resource('api/'+API_VERSION+'/vaccinesControls/',{},
      {
        get:{
          method:"GET",
          headers:  {
            'x-access-token':jwtAuth.getToken()
          }
        },
        post:{
          method:"POST",
          headers:  {
            'x-access-token':jwtAuth.getToken()
          }
        }
      }
    );
  }
]);
