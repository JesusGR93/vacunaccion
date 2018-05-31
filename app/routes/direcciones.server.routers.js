// Invoke 'strict' JavaScript mode
'use strict';

var v1 = '/api/v1/';
var entity = 'direccione';
var direccionPath = v1 + entity + 's/';
var controllerPath = ['../../app/controllers/', '.server.controller'];

var controller = require(controllerPath[0] + 'direcciones' + controllerPath[1]);
var crud = require(controllerPath[0] + 'crud' + controllerPath[1]);
var tools = require(controllerPath[0] + 'tools' + controllerPath[1]);


module.exports = function(app) {
    // Doctor's routes
    app.route(direccionPath)
      .get(tools.isAuthenticated,
        tools.mustBeAdmin,
        controller.findOne,
        crud.findPersonsByIcontains)
      .post(
        controller.create,
        crud.createDirecciones);
  };
  