var Schema = "Vaccine";

var mongoose = require('mongoose');
var Model = mongoose.model(Schema);
// var ModelTrash = mongoose.model('Deleted'+Schema);
var crud = require('./crud.server.controller');
var tools = require('./tools.server.controller');

//var populate = "administration_route previous_vaccine";
var populate = [{
  path: 'administration_route',
  select: '-__v -fecha_creacion',
  model: 'AdministrationRoute'
}, {
  path: 'previous_vaccine',
  select: '-__v -fecha_creacion',
  model: 'DosageVaccine'
}];

/*
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
  data.name = req.object.name;
  data.administration_route = req.object.administration_route;
  data.dosage = req.object.dose;
  data.gender = req.object.gender;

  if (req.object.previous_vaccine) {
    data.previous_vaccine = req.object.previous_vaccine;
  }
  if (req.object.picture) {
    data.picture = req.object.picture;
  }

  return res.send({
    success: true,
    data: data
  });
};
*/

exports.readAll = function(req, res, next) {
  req.model = Model;
  req.select = '-__v -fecha_creacion';
  req.populate = populate;

  next();
};

/*
exports.update = function(req, res, next) {
  if (req.body.name) {
    req.object.name = req.body.name;
  }
  if (req.body.previous_vaccine) {
    req.object.previous_vaccine = req.body.previous_vaccine;
  }
  if (req.body.administration_route) {
    req.object.administration_route = req.body.administration_route;
  }
  if (req.body.dose) {
    req.object.dose = req.body.dose;
  }
  if (req.body.gender) {
    req.object.gender = req.body.gender;
  }
  if (req.body.picture) {
    req.finish = true;
    crud.savePicture(req, res, Schema, next);
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
  if (req.object.previous_vaccine) {
    documentDeleted.previous_vaccine = req.object.previous_vaccine._id;
  }
  if (req.object.administration_route) {
    documentDeleted.administration_route = req.object.administration_route._id;
  }
  if (req.object.dose) {
    documentDeleted.dose = req.object.dose;
  }
  if (req.object.gender) {
    documentDeleted.gender = req.object.gender;
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
        success: true
      });
    });
  });
};
*/