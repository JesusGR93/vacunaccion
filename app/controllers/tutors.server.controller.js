// Invoke 'strict' JavaScript mode
'use strict';


// Load 'Tutor' Mongoose model
var mongoose = require('mongoose');
var Model = mongoose.model('responsables');
var User = mongoose.model('detalle_usuario');
var trashModel = mongoose.model('DeletedUser');

var crud = require('./crud.server.controller');
var tools = require('./tools.server.controller');
var log=require('../../config/log/vacunaccionLog.js');

var Bitacora=mongoose.model('Binnacleuser');

// Create a new 'create' controller method
exports.create = function(req, res, next) {

  // validate if the correo exist to don't avoid create the tutor without credentials.
  User.findOne({correo: req.body.correo.toLowerCase()}, function(err, user) {
    if (err) {
      log.logError('Error de busqueda de user:'+err);
      var error = tools.getErrorMessage(err);
      return res.json(error);

    } else {

      if(!user) {
        
        req.object = new Model({
          address: req.body.address,
          birthdate: req.body.birthdate,
          birthplace: req.body.birthplace,
          client_creation_date: req.body.client_creation_date,
          country_id: req.body.country_id,
          curp: req.body.curp,
          father_surname: req.body.father_surname,
          first_name: req.body.first_name,
          gender: req.body.gender,
          mother_surname: req.body.mother_surname,
          patient: req.body.patient,
          phones: req.body.phones,
          rfc: req.body.rfc
        });

        req.credential = new User({
          correo: req.body.correo.toLowerCase(),
          contrasena: req.body.contrasena,
          rol: req.body.rol,
          red_social: req.body.red_social,
          user: req.object._id
        });

        req.bitacora=new  Bitacora({
          origin:1,
          origin_update:1,
          validated:1,
          date_update:req.body.client_creation_date,
          user:req.object._id,
          correo:req.body.correo.toLowerCase(),
          description:"Nuevo Responsable"
        });
           log.logInfo('se creo el tutor :'+req.body.correo.toLowerCase());
        next();

      } else {
        return res.json({
          success: false,
          message: 'El correo ya se encuentra registrado'
        });
      }
      
    }

  });
};



exports.findOne = function(req, res, next, id) {
  if (req.method === 'DELETE') {
    
    var select = '';
    var populate = [{
      path: 'user',
      model: 'Tutor'
    }];
    
  } else {

    var select = '-__v -rol -fecha_creacion -birthdate_as_iso_date -client_creation_iso_date';
    
    var populate = [{
      path: 'user',
      select: '-__v -birthdate_as_iso_date -client_creation_iso_date -fecha_creacion',
      model: 'Tutor',
      populate: [{
        path: 'cev_id',
        select: '-_id -__v -fecha_creacion',
        model: 'Cev'
      }, {
        path: 'birthplace',
        select: '-__v',
        model: 'State'
      }, {
        path: 'country_id',
        select: '-__v',
        model: 'Country'
      }, {
        path: 'phones',
        select: '-_id'
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
      }, {
        path: 'patient.person',
        select: '-__v -fecha_creacion',
        model: 'Patient',
        populate: [{
          path: 'tutor.person',
          select: '-__v -fecha_creacion',
          model: 'User',
          populate: {
            path: 'user',
            select: 'first_name father_surname mother_surname curp',
            model: 'Tutor',
          }
        },{
          path: 'cev_id',
          select: '-_id -__v -fecha_creacion',
          model: 'Cev'
        }, {
          path: 'birthplace',
          select: '-__v',
          model: 'State'
        }, {
          path: 'country_id',
          select: '-__v',
          model: 'Country'
        }, {
          path: 'address',
          select: '-_id'
        }, {
          path: 'address.state_id',
          model: 'State'
        }, {
          path: 'address.municipality_id',
          model: 'Municipality'
        }, {
          path: 'address.locality_id',
          model: 'Locality'
        }]
      }]
    }];

  }

  User.findById(id)
    .select(select)
    .populate(populate)
    .exec(function(err, object) {
      crud.oneObjectById(req, res, err, object, next);
    });

};


exports.readOne = function(req, res, next) {
  return res.send({
    success: true,
    data: req.object
  });
};


exports.findList = function(req, res, next) {
  req.model = User;
  req.subModel = Model;
  req.select = '-__v -rol -fecha_creacion -birthdate_as_iso_date -client_creation_iso_date -modified';
  
  req.populate = [{
    path: 'user',
    select: '-__v -birthdate_as_iso_date -client_creation_iso_date -fecha_creacion',
    model: 'Tutor',
    populate: [  {
      path: 'address',
      select: '-_id'
    }, {
      path: 'address.state_id',
      select: '-__v',
      model: 'State'
    }]
  }];
  req.body = {rol: 'tutor'};

  next();
};


exports.update = function(req, res, next) {
  User.findOne({_id: req.object._id}, function(err, user) {
    if (err) {
       log.logError('Error de busqueda de tutor:'+err);
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    } else {
      Model.findOne({_id: user.user}, function(err, tutor) {
        if (err) {
          return res.status(400).send({
            success: false,
            message: tools.getErrorMessage(err)
          });
        } else {
          var modified = new Date();

          tutor.address = [];
          if (Array.isArray(req.body.address)) {
            for (var i = 0; i < req.body.address.length; i++) {
              tutor.address.push(req.body.address[i]);
            }
          }

          tutor.birthdate = req.body.birthdate;
          tutor.birthplace = req.body.birthplace;
          tutor.client_creation_date = req.body.client_creation_date;

          tutor.country_id = req.body.country_id;
          tutor.curp = req.body.curp;
          tutor.father_surname = req.body.father_surname;
          tutor.first_name = req.body.first_name;
          tutor.gender = req.body.gender;
          tutor.masked_id = req.body.masked_id;
          tutor.modified = modified;
          tutor.mother_surname = req.body.mother_surname;

          tutor.patient = [];
          if (req.body.patient !== undefined) {
            if (Array.isArray(req.body.patient)) {
              for (var i = 0; i < req.body.patient.length; i++) {
                tutor.patient.push(req.body.patient[i]);
              }
            } else {
              tutor.patient.push(req.body.patient);
            }
          }

          tutor.phones = [];
          if (Array.isArray(req.body.phones)) {
            for (var i = 0; i < req.body.phones.length; i++) {
              tutor.phones.push(req.body.phones[i]);
            }
          }

          tutor.rfc = req.body.rfc;

          user.correo = req.body.correo.toLowerCase();
          user.modified = modified;
          user.rol = user.rol;  // Keep the value
          
          if (req.body.contrasena) {
            user.contrasena = req.body.contrasena;
          }
           req.bitacora=new  Bitacora({
          origin:1,
          origin_update:1,
          validated:1,
          date_update:req.body.client_creation_date,
          user:req.object._id,
          correo:req.body.correo.toLowerCase(),
          description:"Modificación de Responsable"
        });
      
          user.save(function(err) {
            if (err) {
               log.logError('Error de modificación de user:'+err);
              return res.send({
                success: false,
                message: tools.getErrorMessage(err)
              });
            }
          
            tutor.save(function(err) {
              if (err) {
                 log.logError('Error de guardado de tutor:'+err);
                return res.send({
                  success: false,
                  message: tools.getErrorMessage(err)
                });
              }
    
              return res.send({
                success: true,
                message: 'Tutor modificado exitosamente'
              });
            });
          });
          next();
        }
      });
    }
  });
};


exports.delete = function(req, res, next) {
  // It's required to copy the req.object element by element instead of only
  // change it to the trash model in order to avoid the error:
  // 'VersionError: No matching document found for id'
  var deletedUser = {};

  deletedUser.correo = req.object.correo;
  deletedUser.contrasena = req.object.contrasena;
  deletedUser.rol = req.object.rol;
  deletedUser.url_token = req.object.url_token;
  deletedUser.user = {};

  deletedUser.user.address = req.object.user.address;
  deletedUser.user.birthdate = req.object.user.birthdate;
  deletedUser.user.birthdate_as_iso_date = 
    req.object.user.birthdate_as_iso_date;
  deletedUser.user.birthplace = req.object.user.birthplace;
  deletedUser.user.client_creation_date = req.object.user.client_creation_date;
  deletedUser.user.client_creation_iso_date = 
    req.object.user.client_creation_iso_date;
  deletedUser.user.country_id = req.object.user.country_id;
  deletedUser.user.curp = req.object.user.curp;
  deletedUser.user.father_surname = req.object.user.father_surname;
  deletedUser.user.first_name = req.object.user.first_name;
  deletedUser.user.gender = req.object.user.gender;
  deletedUser.user.cev_id = req.object.user.cev_id;
  deletedUser.user.mother_surname = req.object.user.mother_surname;
  deletedUser.user.patient = req.object.user.patient;
  deletedUser.user.phones = req.object.user.phones;
  deletedUser.user.rfc = req.object.user.rfc;
  deletedUser.user.fecha_creacion = req.object.user.fecha_creacion;
  deletedUser.user.modified = req.object.user.modified;
  deletedUser.fecha_creacion = req.object.fecha_creacion;
  deletedUser.modified = req.object.modified;

  req.oldObject = req.object;
  req.object = new trashModel(deletedUser);
  req.trash = true;
 req.bitacora=new  Bitacora({
          origin:1,
          origin_update:1,
          validated:1,
          date_update:req.body.client_creation_date,
          user:req.object.user._id,
          correo:req.object.correo,
          description:"Eliminacion de Responsable"
        });

  next();
};
