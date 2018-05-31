// Invoke 'strict' JavaScript mode
'use strict';


var v1 = '/api/v1/';
var entity = 'localitie';
var localityPath = v1 + entity + 's/';
var controllerPath = ['../../app/controllers/', '.server.controller'];
var controller = require(controllerPath[0] + 'localities' + 
  controllerPath[1]);
var crud = require(controllerPath[0] + 'crud' + controllerPath[1]);
var tools = require(controllerPath[0] + 'tools' + controllerPath[1]);


// Define the routes' module method
module.exports = function(app) {
  // Municipality's routes
  app.route(localityPath)
    .post(tools.isAuthenticated,
      tools.mustBeAdminOrDoctorOrTutor,
      controller.readAll,
      crud.readAll);


  app.route(localityPath + ':state_id/state/:municipality_id/municipality')
    .get(tools.getEntity,
      tools.isAuthenticated,
      tools.mustBeAdminOrDoctorOrTutor,
      controller.find,
      crud.find);
};
