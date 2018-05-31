// Invoke 'strict' JavaScript mode
'use strict';


var v1 = '/api/v1/';
var entity = 'tutor';
var tutorPath = v1 + entity + 's/';
var controllerPath = ['../../app/controllers/', '.server.controller'];
var controller = require(controllerPath[0] + 'tutors' + controllerPath[1]);
var crud = require(controllerPath[0] + 'crud' + controllerPath[1]);
var tools = require(controllerPath[0] + 'tools' + controllerPath[1]);


// Define the routes' module method
module.exports = function(app) {
  // Tutor's routes
  app.route(tutorPath)
    .get(tools.isAuthenticated,
      tools.mustBeAdminOrDoctor,
      controller.findList,
      crud.findPersonsByIcontains)
    .post(
      controller.create, 
      crud.createCev,
      crud.create,
      crud.createUser,
      crud.createBitacoraUser);

  app.route(tutorPath + ':' + entity + 'Id')
    .get(tools.isAuthenticated,
      tools.mustBeAdminOrDoctorOrTutorOwner,
      controller.readOne)
    .put(tools.isAuthenticated,
      tools.mustBeAdminOrTutorOwner,
      controller.update,
      crud.createBitacoraUser)
    .delete(tools.isAuthenticated,
      tools.mustBeAdmin,
      controller.delete,
      crud.create,
      crud.delete,
      crud.createBitacoraUser);
  app.param(entity + 'Id', controller.findOne);
}
