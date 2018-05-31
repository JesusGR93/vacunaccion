// Invoke 'strict' JavaScript mode
'use strict';


var v1 = '/api/v1/';
var entity = 'doctor';
var doctorPath = v1 + entity + 's/';
var controllerPath = ['../../app/controllers/', '.server.controller'];
var controller = require(controllerPath[0] + 'doctors' + controllerPath[1]);
var crud = require(controllerPath[0] + 'crud' + controllerPath[1]);
var tools = require(controllerPath[0] + 'tools' + controllerPath[1]);


// Define the routes' module method
module.exports = function(app) {
  // Doctor's routes
  app.route(doctorPath)
    .get(tools.isAuthenticated,
      tools.mustBeAdmin,
      controller.findList,
      crud.findPersonsByIcontains)
    .post(
      controller.create,
      crud.createClinicDoctor,
      crud.create,
      crud.createUser,
      crud.createBitacoraUser);

  app.route(doctorPath + ':' + entity + 'Id')
    .get(tools.isAuthenticated,
      tools.mustBeAdminOrDoctorOwner,
      controller.readOne)
    .put(tools.isAuthenticated,
      tools.mustBeAdminOrDoctorOwner,
      controller.update,
      crud.createBitacoraUser)
    .delete(tools.isAuthenticated,
      tools.mustBeAdmin,
      controller.delete,
      crud.create,
      crud.delete,
      crud.createBitacoraUser);

  app.param(entity + 'Id', controller.findOne);
};
