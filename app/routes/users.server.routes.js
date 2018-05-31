// Invoke 'strict' JavaScript mode
'use strict';


var v1 = '/api/v1/';
var entity = 'user';
var userPath = v1 + entity + 's/';
var adminPath = v1 + 'admins/';
var controllerPath = ['../../app/controllers/', '.server.controller'];
var controller = require(controllerPath[0] + 'users' + controllerPath[1]);
var cev = require(controllerPath[0] + 'cev' + controllerPath[1]);
var crud = require(controllerPath[0] + 'crud' + controllerPath[1]);
var tools = require(controllerPath[0] + 'tools' + controllerPath[1]);


// Define the routes' module method
module.exports = function(app) {
  // General user's paths
  app.route(userPath + 'login')
    .post(controller.login);

  app.route(userPath + 'loginsocialnet')
    .post(controller.loginsocialnet,crud.createBitacoraUser);
    //.post(controller.loginsocialnet);

  app.route(userPath + 'recoverPassword')
    .post(controller.recoverPassword);

  app.route(userPath + 'restorePassword')
    .post(controller.restorePassword);

  app.route(userPath + 'activate')
    .get(controller.activate);

  app.route(userPath + 'cev2')
    .post(tools.isAuthenticated,
      tools.mustBeAdminOrDoctorOrTutor,
      cev.getCev,
      cev.checkIfExtist,
      cev.getPatient,
      cev.getVaccines,
      cev.updateVaccines,
      cev.getVaccines,
      cev.getTutor);

  // Admin's routes
  app.route(adminPath)
    .get(tools.isAuthenticated,
      tools.mustBeAdmin,
      controller.findList,
      crud.findPersonsByIcontains)
    .post(tools.isAuthenticated,
      tools.mustBeAdmin,
      controller.create,
      crud.create,
      crud.createUser);

  app.route(adminPath + ':' + entity + 'Id')
    .get(tools.isAuthenticated,
      tools.mustBeAdmin,
      controller.readOne)
    .put(tools.isAuthenticated,
      tools.mustBeAdmin,
      controller.update,
      crud.update)
    .delete(tools.isAuthenticated,
      tools.mustBeAdmin,
      controller.delete,
      crud.create,
      crud.delete);

  app.param(entity + 'Id', controller.findOne);
};
