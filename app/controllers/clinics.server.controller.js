// Invoke 'strict' JavaScript mode
'use strict';


// Load 'Clinic' Mongoose model
var mongoose = require('mongoose');
var Model = mongoose.model('cat_clinicas');
var crud = require('./crud.server.controller');
var tools = require('./tools.server.controller');
var trashModel = mongoose.model('DeletedClinic');
var Bitacora=mongoose.model('Binnacleuser');
var log=require('../../config/log/vacunaccionLog.js');
// Create a new 'create' controller method
exports.create = function(req, res, next) {
  req.object = new Model({
    id_clinica: req.body.id_clinica,
    nombre: req.body.nombre,
    id_estado: req.body.id_estado,
    id_municipio: req.body.id_municipio,
    id_localidad: req.body.id_localidad,
    codigo_postal:req.body.codigo_postal,
    fecha_registro_app: req.body.fecha_registro_app,
    fecha_registro: req.body.fecha_registro,
    fecha_ultima_modificacion: req.body.fecha_ultima_modificacion,
    fecha_eliminacion: req.body.fecha_eliminacion
  });


req.bitacora=new  Bitacora({
          origin:1,
          origin_update:1,
          validated:1,
          correo:req.body.id,
          date_update:req.body.client_creation_date,
          user:req.object._id,
          description:"Nuevo Clinica"
        });

  next();
};


exports.findOne = function(req, res, next, id) {

  if (req.method === 'DELETE') {
    var populate = '';  // Avoid populate object for soft-deleting
    var select = '';
  } else {
    var select = 'id name address';

    var populate = [{
      path: 'address',
      select: '-_id'
    }, {
      path: 'address.state_id',
      select: '-__v',
      model: 'State',
    }, {
      path: 'address.municipality_id',
      select: '-__v -_id',
      model: 'Municipality',
    }, {
      path: 'address.locality_id',
      select: '-__v -_id',
      model: 'Locality',
    }];
  }

  Model.findById(id)
    .select(select)
    .populate(populate)
    .exec(function(err, object) {
      if (err &&
          err.name === 'CastError' && 
          err.path === '_id' && 
          req.method === 'GET') {
             log.logError('Error de busqueda de clinica:'+err);
        Model.find({id: id})
          .select(select)
          .populate(populate)
          .exec(function(err, object) {
            crud.oneObjectById(req, res, err, object[0], next);
          })
      } else {
        crud.oneObjectById(req, res, err, object, next);
      }
    });
};


exports.findList = function(req, res, next) {
  req.model = Model;
  
  req.select = 'id name address';
  req.populate = [{
    path: 'affiliation_id',
    select: '-__v',
    model: 'Affiliation'
  }, {
    path: 'address',
    select: '-_id'
  }, {
    path: 'address.state_id',
    select: '-__v',
    model: 'State'
  }, {
    path: 'address.municipality_id',
    select: '-__v -_id',
          model: 'Municipality'
  }, {
    path: 'address.locality_id',
    select: '-__v -_id',
    model: 'Locality'
  }];

  next();
};

exports.readOne = function(req, res, next) {
  return res.send({
    success: true,
    data: req.object
  });
};


exports.update = function(req, res, next) {
  Model.findOne({_id: req.object._id}, function(err, clinic) {
    if (err) {
       log.logError('Error de actualización de clinica:'+err);
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }

    // The conditions are added because without them this method will be an
    // simply insert
    if (req.body.id) {
      clinic.id = req.body.id;
    }

    if (req.body.name) {
      clinic.name = req.body.name;
    }

    if (req.body.address) {
      // Empty the array and insert the data again because the locality_id is
      // mapped
      clinic.address = [];
      if (Array.isArray(req.body.address)) {
        for (var i = 0; i < req.body.address.length; i++) {
          clinic.address.push(req.body.address[i]);
        }
      }
    }

    clinic.modified = new Date();

    req.object = clinic;
    req.finish = true;

req.bitacora=new  Bitacora({
          origin:1,
          origin_update:1,
          validated:1,
          correo:clinic.id,
          date_update:req.body.client_creation_date,
          user:clinic._id,
          description:"Modificación de la Clinica"
        });
    next();
  });
};


exports.delete = function(req, res, next) {
  // It's required to copy the req.object element by element instead of only
  // change it to the trash model in order to avoid the error: 
  // 'VersionError: No matching document found for id'
  var deletedClinic = {};

  deletedClinic.id = req.object.id;
  deletedClinic.name = req.object.name;
  deletedClinic.address = req.object.address;
  deletedClinic.fecha_creacion = req.object.fecha_creacion;
  deletedClinic.modified = req.object.modified;

  req.oldObject = req.object;
  req.object = new trashModel(deletedClinic);
  req.trash = true;
req.bitacora=new  Bitacora({
          origin:1,
          origin_update:1,
          validated:1,
          correo:req.object.id,
          date_update:req.body.client_creation_date,
          description:"Eliminación de la Clinica"
        });
  next();
};
