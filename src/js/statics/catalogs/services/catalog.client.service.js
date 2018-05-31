
angular.module('catalogs').service('CatalogService', [
   '$rootScope', 'AffiliationFactory', 'BloodTypeFactory', 'CountryFactory', 'VaccineDosageFactory',
  'KinshipFactory', 'StateFactory', 'StreetTypeFactory', 'SuburbTypeFactory', 'VaccineFactory',
  function($rootScope, AffiliationFactory, BloodTypeFactory, CountryFactory, VaccineDosageFactory,
           KinshipFactory, StateFactory, StreetTypeFactory, SuburbTypeFactory, VaccineFactory) {

    this.load = function() {

      $rootScope.catalog = {};

      $rootScope.catalog.gender = ['HOMBRE', 'MUJER'];


      AffiliationFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.affiliations = response.data;
          } 
          else {
            console.log("Error to get affiliations not found");
          }
        },
        function(errorResponse) {
          console.log("ErrorResponse to get affiliations not found");
        }
      );


      BloodTypeFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.bloodTypes = response.data;
          } 
          else {
            console.log("Error to get blood types not found");
          }
        },
        function(errorResponse) {
            console.log("ErrorResponse to get blood types not found");
        }
      );


      CountryFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.countries = response.data;
          } 
          else {
            console.log("Error to get countries not found");
          }
        },
        function(errorResponse) {
          console.log("ErrorResponse to get blood types not found");
        }
      );


      KinshipFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.kinships = response.data;
          } 
          else {
            console.log("Error to get states not found");
          }
        },
        function(errorResponse) {
          console.log("ErrorResponse to get states not found");
        }
      );


      StateFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.states = response.data;
          } 
          else {
            console.log("Error to get states not found");
          }
        },
        function(errorResponse) {
          console.log("ErrorResponse to get states not found");
        }
      );


      StreetTypeFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.streetTypes = response.data;
          }
          else {
            console.log("Error to get street types not found");
          }
        },
        function(errorResponse){
          console.log("ErrorResponse to get street types not found");
        }
      ); 


      SuburbTypeFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.suburbTypes = response.data;
          }
          else {
            console.log("Error to get suburbs types not found");
          }
        },
        function(errorResponse){
          console.log("ErrorResponse to get suburbs types not found");
        }
      ); 

      VaccineFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.vaccines = response.data;
          }
          else {
            console.log("Error to get vaccines not found");
          }
        },
        function(errorResponse){
          console.log("ErrorResponse to get vaccines not found");
        }
      ); 

      VaccineDosageFactory.get(
        function(response) {
          if(response.success) {
            $rootScope.catalog.vaccinesDosage = response.data;
          }
          else {
            console.log("Error to get dosage vaccines not found");
          }
        },
        function(errorResponse){
          console.log("ErrorResponse to get dosage vaccines not found");
        }
      ); 

    }
  }

]);
