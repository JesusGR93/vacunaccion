angular.module('vaccines').factory('Vaccines',['$resource',
  'API_VERSION','jwtAuth',
  function($resource,
    API_VERSION,jwtAuth){
    return $resource('api/'+API_VERSION+'/vaccines/:vaccinesId',{
        vaccinesId: '@_id'
      },
      {
        remove:{
          method:"DELETE",
          headers:  {
            'x-access-token':jwtAuth.getToken()
          }
        },
        get:{
          method:"GET",
          headers:  {
            'x-access-token':jwtAuth.getToken()
          }
        },
        save:{
          method:"POST",
          headers:  {
            'x-access-token':jwtAuth.getToken()
          }
        }
      }
    );
  }
]);
