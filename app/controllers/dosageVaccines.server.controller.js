// Invoke 'strict' JavaScript mode
'use strict';


var Schema = "DosageVaccine";

var mongoose = require('mongoose');
var Model = mongoose.model(Schema);
// var ModelTrash = mongoose.model('Deleted'+Schema);
var crud = require('./crud.server.controller');
var tools = require('./tools.server.controller');

var populate = [{
  path: 'vaccine',
  select: '-__v -fecha_creacion',
  model: 'Vaccine'
}, {
  path: 'application_age',
  select: '-__v -fecha_creacion',
  model: 'ApplicationAge'
}];


exports.create = function(req, res, next) {
  if (!req.body.id){
    return res.status(400).send({
      success: false,
      message: "Error: debe especificar un ID de CEV"
    });
  }
  req.body._id = req.body.id;
  req.object = new Model(req.body);
  if (req.body.picture) {
    crud.savePicture(req, res, Schema, next, Model);
  } else {
    next();
  }
};


exports.findOne = function(req, res, next, id) {
  Model.findById(id)
  .populate(populate)
  .exec(function(err, object) {
    crud.oneObjectById(req, res, err, object, next);
  });
};


exports.readOne = function(req, res, next) {
  var data = {};
  data._id = req.object._id;
  data.vaccine = req.object.vaccine;
  data.application_age = req.object.application_age;
  data.description = req.object.description;

  if (req.object.column) {
    data.column = req.object.column;
  }

  return res.send({
    success: true,
    data: data
  });
};


exports.readAll = function(req, res, next) {
  req.model = Model;
  req.select = '-__v -fecha_creacion';
  req.populate = populate;

  next();
};


exports.update = function(req, res, next) {
  if (req.body.vaccine) {
    req.object.vaccine = req.body.vaccine;
  }
  if (req.body.application_age) {
    req.object.application_age = req.body.application_age;
  }
  if (req.body.description) {
    req.object.description = req.body.description;
  }
  if (req.body.column) {
    req.object.column = req.body.column;
  }

  if (!req.object) {
    return res.json({
      success: false,
      message: Data.msgNoFields()
    });
  }

  req.object.modified = new Date();
  

  req.finish = true;
  next();
};


exports.delete = function(req, res, next) {
  var documentDeleted = {};
  if (req.object.vaccine) {
    documentDeleted.vaccine = req.object.vaccine._id;
  }
  if (req.object.application_age) {
    documentDeleted.application_age = req.object.application_age._id;
  }
  if (req.object.description) {
    documentDeleted.description = req.object.description;
  }
  if (req.object.column) {
    documentDeleted.column = req.object.column;
  }

/*
  documentDeleted = new ModelTrash(documentDeleted);
  documentDeleted.save(function(err) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }
    req.object.remove(function(err) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      }
      return res.status(200).json({
        success:  true,
        message:  "Eliminado correctamente"
      });
    });
  });*/
};
