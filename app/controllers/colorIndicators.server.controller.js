// invoke 'strict' JavaScript mode
'use strict';


var Schema = "ColorIndicator";

var mongoose = require('mongoose');
var Model = mongoose.model(Schema);
var ModelTrash = mongoose.model(Schema);
var crud = require('./crud.server.controller');
var tools = require('./tools.server.controller');


exports.create = function(req, res, next) {
  if (!req.body.id){
    return res.status(400).send({
      success: false,
      message: "Error: debe especificar un ID de CEV"
    });
  }
  req.body._id = req.body.id;
  req.object = new Model(req.body);
  
  next();
};

exports.findOne = function(req, res, next, id) {
  Model.findById(id)
  .populate('')
  .exec(function(err, object) {
    crud.oneObjectById(req, res, err, object, next);
  });
};


exports.readOne = function(req, res, next) {
  var data = {};
  data._id = req.object._id;
  data.name = req.object.name;

  if (req.object.description) {
    data.description = req.object.description;
  }

  return res.send({
    success: true,
    data: data
  });
};


exports.readAll = function(req, res, next) {
  req.model = Model;
  req.populate = '';
  req.select = '-__v -fecha_creacion';

  next();
};


exports.update = function(req, res, next) {
  if (req.body.name) {
    req.object.name = req.body.name;
  }
  if (req.body.description) {
    req.object.description = req.body.description;
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
  documentDeleted.id = req.object._id;
  if (req.object.name) {
    documentDeleted.name = req.object.name;
  }
  if (req.object.description) {
    documentDeleted.description = req.object.description;
  }

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
  });
};
