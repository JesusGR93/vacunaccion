// Invoke 'strict' JavaScript mode
'use strict';


var v1 = '/api/v1/';
var entity = 'colorindicator';
var colorindicatorsPath = v1 + entity + 's/';
var controllerPath = ['../../app/controllers/', '.server.controller'];
var controller = require(controllerPath[0] + 'colorindicators' + controllerPath[1]);
var crud = require(controllerPath[0] + 'crud' + controllerPath[1]);
var tools = require(controllerPath[0] + 'tools' + controllerPath[1]);


// Define the routes' module method
module.exports = function(app) {
  // State's routes
  app.route(colorindicatorsPath)
    .get(tools.isAuthenticated,
      tools.mustBeAdminOrDoctorOrTutor,
      controller.readAll,
      crud.readAll)
};
