// Invoke 'strict' JavaScript mode
'use strict';


var v1 = '/api/v1/';
var entity = 'patient';
var patientPath = v1 + entity + 's/';
var controllerPath = ['../../app/controllers/', '.server.controller'];
var controller = require(controllerPath[0] + 'patients' + controllerPath[1]);
var crud = require(controllerPath[0] + 'crud' + controllerPath[1]);
var tools = require(controllerPath[0] + 'tools' + controllerPath[1]);


// Define the routes' module method
module.exports = function(app) {
  // Admin's routes
  app.route(patientPath)
    .get(tools.isAuthenticated,
      tools.mustBeAdminOrDoctor,
      controller.findList,
      crud.findPatients)
    .post(tools.isAuthenticated,
      tools.mustBeAdminOrDoctorOrTutor,
      controller.create,
      crud.createCev,
      crud.create,
      crud.createBitacoraUser);

  app.route(patientPath + ':' + entity + 'Id')
    .get(tools.isAuthenticated,
      tools.mustBeAdminOrDoctorRefOrTutorRef,
      controller.readOne)
    .put(tools.isAuthenticated,
      tools.mustBeAdminOrDoctorRefOrTutorRef,
      controller.update,
      crud.update)
    .delete(tools.isAuthenticated,
      tools.mustBeAdmin,
      controller.delete,
      crud.create,
      crud.delete,
      crud.createBitacoraUser);

  app.param(entity + 'Id', controller.findOne);
}
