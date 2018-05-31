// Invoke 'strict' JavaScript mode
'use strict';


var v1 = '/api/v1/';
var entity = 'catclinica';
var catclinicaPath = v1 + entity + 's/';
var controllerPath = ['../../app/controllers/', '.server.controller'];
var controller = require(controllerPath[0] + 'clinics' + controllerPath[1]);
var crud = require(controllerPath[0] + 'crud' + controllerPath[1]);
var tools = require(controllerPath[0] + 'tools' + controllerPath[1]);


// Define the routes' module method
module.exports = function(app) {
  // Clinic's routes
  app.route(catclinicaPath)
    .post(
      controller.create,
      crud.createClinic,
      crud.createBitacoraUser)
    // .get(tools.isAuthenticated,
    //   tools.mustBeAdminOrDoctor,
    //   controller.findList,
    //   crud.findClinicsByIcontain)

  app.route(catclinicaPath + ':' + entity + 'Id')
    .get(tools.isAuthenticated,
      tools.mustBeAdminOrDoctor,
      controller.readOne)

    .put(tools.isAuthenticated,
      tools.mustBeAdmin,
      controller.update,
      crud.update,
      crud.createBitacoraUser)

    .delete(tools.isAuthenticated,
      tools.mustBeAdmin,
      controller.delete,
      crud.createClinic,
      crud.delete,
      crud.createBitacoraUser);

  app.param(entity + 'Id', controller.findOne);
};
