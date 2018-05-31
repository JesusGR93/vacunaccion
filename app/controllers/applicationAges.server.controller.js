var Schema = "ApplicationAge";

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
  if (req.body.picture) {
    crud.savePicture(req, res, Schema, next, Model);
  } else {
    next();
  }
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
  data.optimal = req.object.optimal;

  if (req.object.min) {
    data.min = req.object.min;
  }
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
  if (req.body.min) {
    req.object.min = req.body.min;
  }
  if (req.body.optimal) {
    req.object.optimal = req.body.optimal;
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
  if (req.object.min) {
    documentDeleted.min = req.object.min;
  }
  if (req.object.optimal) {
    documentDeleted.optimal = req.object.optimal;
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
