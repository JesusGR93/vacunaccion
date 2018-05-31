angular.module('vaccines').controller('VaccinesController', [
  '$scope','$routeParams', '$location',
  'Tools','Upload',
  'Vaccines','AdministrationRoutes',
  '$mdDialog',
  function($scope, $routeParams, $location,
  Tools,Upload,
  Model,AdministrationRoutes,
  $mdDialog){
    $scope.genderArray = [
      "Mujeres",
      "Hombres"
    ];

    $scope.error = "";
    $scope.picture64 = false;

    var errorResponse = function(errorResponse){
      console.log(errorResponse);
      if (errorResponse.status !== -1){
        $scope.error = "* " +
          (errorResponse.data.message ||
            errorResponse.data);
      } else {
        $scope.error = "* Error: revise su conexión a internet.";
      }
    };

    $scope.readAllVaccines = function(){
      Model.get(
        function(response) {
          if (response.success) {
            $scope.vaccinesList = response.data;
          } else {
            $scope.error = "* " + response.msg;
          }
        },
        errorResponse
      );
    };
    $scope.readAllAdministrationRoutes = function(){
      AdministrationRoutes.get(
        function(response) {
          if (response.success) {
            $scope.administrationRoutes = response.data;
          } else {
            $scope.error = "* " + (response.msg || response.message);
          }
        },
        errorResponse
      );
    };

    $scope.submit = function(){
      var picture;
      if (this.picture) {
        picture = {
          file: $scope.picture64,
          name: this.picture[0].name
        };
      }
      var vaccine = new Model({
        id:                   $scope.id,
        name:                 $scope.name,
        previous_vaccine:     $scope.previousVaccine,
        administration_route: $scope.administrationRoute,
        dose:                 $scope.dose,
        gender:               $scope.gender,
        picture:              picture || undefined
      });
      vaccine.$save(
        function(response) {
          if (response.success) {
            $location.path("vaccines/");
          } else {
            $scope.error = "* " + response.msg;
          }
        },
        errorResponse
      );
    };

    $scope.deleteConfirmation = function(ev,index) {
      var item = this.item;
      var confirm = $mdDialog.confirm()
          .title('¿Esta seguro que desea eliminar este registro?')
          .textContent('Si elimina este registro, ya no estará disponible ' +
                        'para otros usuarios')
          .ariaLabel('Eliminar registro')
          .targetEvent(ev)
          .ok('Eliminar')
          .cancel('Cancelar');
      $mdDialog.show(confirm).then(function() {
        $scope.delete(index,item);
      }, function() {
        return;
      });
    };

    $scope.delete = function(index,item){
      this.item = Model.remove({
          vaccinesId: item._id
        },
        function(response){
          if (response.success) {
            $scope.vaccinesList.splice(index, 1);
          } else {
            $scope.error = response.msg;
          }
        },
        function(errorResponse){
          console.log(errorResponse);
          $scope.error = errorResponse.data.msg;
        }
      );
    };

    $scope.onChangePicture = function(){
      var reader = new FileReader();
      reader.onload = $scope.loadRenderPicture;
      if (this.picture[0]) {
        reader.readAsDataURL(this.picture[0]);
      }
    };
    $scope.loadRenderPicture = function(e){
      $scope.picture64 = e.target.result;
      document.getElementById("picture-preview")
        .style.background = "url("+e.target.result+")";
    };

    $scope.menuSelected = function(menu){
      if (menu.path == "/vaccines") {
        menu.selected = true;
      }
    };

  }
]);
