// Invoke 'strict' JavaScript mode
'use strict';


var v1 = '/api/v1/';
var entity = 'vaccinesControl';
var rootPath = v1 + entity + 's/';
var controllerPath = ['../../app/controllers/', '.server.controller'];
var controller = require(controllerPath[0] + entity + 's' + controllerPath[1]);
var crud = require(controllerPath[0] + 'crud' + controllerPath[1]);
var tools = require(controllerPath[0] + 'tools' + controllerPath[1]);


// Define the routes' module method
module.exports = function(app) {
  // Control vaccines' routes
  app.route(rootPath)
    .get(tools.isAuthenticated,
      tools.mustBeAdminOrDoctorOrTutor,
      controller.readAll,
      crud.readAll)
    .post(tools.isAuthenticated,
      tools.mustBeAdminOrDoctor,
      controller.create,
      crud.createVaccinesControl);

  app.route(rootPath + ':' + entity + 'Id')
    .get(tools.isAuthenticated,
      tools.mustBeAdminOrDoctorOrTutor,
      controller.readOne)
    .put(tools.isAuthenticated,
      tools.mustBeAdminOrDoctor,
      controller.update,
      crud.update)
    .delete(tools.isAuthenticated,
      tools.mustBeAdmin,
      controller.delete,
      crud.create,
      crud.delete);

  app.route(rootPath + 'patient/:' + entity + 'ByPatientId')
    .get(tools.isAuthenticated,
      tools.mustBeAdminOrDoctorOrTutor,
      controller.readAllByPatientId);

  app.param(entity + 'ByPatientId', controller.getPatientId);
  app.param(entity + 'Id', controller.findOne);
};
