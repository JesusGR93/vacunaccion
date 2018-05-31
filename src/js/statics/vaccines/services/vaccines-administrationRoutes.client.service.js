  angular.module('vaccines').factory('AdministrationRoutes',['$resource',
  'API_VERSION','jwtAuth',
  function($resource,
    API_VERSION,jwtAuth){
    return $resource('api/'+API_VERSION+'/administrationRoutes/',{},
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
