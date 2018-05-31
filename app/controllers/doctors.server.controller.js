// Invoke 'strict' JavaScript mode
'use strict';


// Load 'Doctor' Mongoose model
var mongoose = require('mongoose');
var Model = mongoose.model('Medico');
var User = mongoose.model('detalle_usuario');
var trashModel = mongoose.model('DeletedUser');
var Clinic=mongoose.model('cat_clinicas');
var crud = require('./crud.server.controller');
var tools = require('./tools.server.controller');

var Bitacora=mongoose.model('Binnacleuser');
var log=require('../../config/log/vacunaccionLog.js');

// Create the objects for saving the entity in user's and admin's collections
exports.create = function(req, res, next) {

  // validate if the correo exist to don't avoid create the tutor without credentials.

  User.findOne({correo: req.body.correo.toLowerCase()}, function(err, user) {
    if (err) {
      log.logError('Error al buscar un doctor' + err);
      var error = tools.getErrorMessage(err);
      return res.json(error);

    } else {

      if(!user) {
        var clinic=[];
        if(req.body.clinic.length === 1 ){
          if(!req.body.clinic[0]._id){
            req.clinic = new  Clinic(req.body.clinic[0]);
            clinic=req.clinic;
            
          }else{
            clinic=req.body.clinic[0]._id;
          }
        }else{
         
          if (req.body.clinic !== undefined) {
            if (Array.isArray(req.body.clinic)) {
              for (var i = 0; i < req.body.clinic.length; i++) {
                clinic.push(req.body.clinic[i]);
              }
            } else {
             clinic.push(req.body.clinic);
            }
          }
        }
        

        req.object = new Model({
          direccion: req.body.direccion,
          birthdate: req.body.birthdate,
          birthplace: req.body.birthpldace,
          client_creation_date: req.body.client_creation_date,
          clinic: clinic,
          country_id: req.body.country_id,
          curp: req.body.curp,
          father_surname: req.body.father_surname,
          first_name: req.body.first_name,
          gender: req.body.gender,
          mother_surname: req.body.mother_surname,
          patient: req.body.patient,
          phones: req.body.phones,
          professional_license: req.body.professional_license,
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
          description:"Nuevo Medico"
        });
        log.logInfo('Se registro doctor  _id : '+  req.object._id +' con el correo : '+ req.body.correo.toLowerCase());
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
      model: 'Doctor'
    }];
    
  } else {

    var select = '-__v  -fecha_creacion -birthdate_as_iso_date -client_creation_iso_date';

    var populate = [{
      path: 'user',
      select: '-__v  -birthdate_as_iso_date -client_creation_iso_date -fecha_creacion',
      model: 'Doctor',
      populate: [{
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
        path: 'direccion',
        select: '-_id',
      }, {
        path: 'direccion.state_id',
        select: '-__v',
        model: 'State'
      }, {
        path: 'direccion.municipality_id',
        select: '-__v -_id',
        model: 'Municipality'
      }, {
        path: 'direccion.locality_id',
        select: '-__v -_id',
        model: 'Locality'
      }, {
        path: 'clinic',
        select: '-__v -fecha_creacion',
        model: 'Clinic',
        populate: [{
          path: 'affiliation_id',
          select: '-__v',
          model: 'Affiliation'
        }, {
          path: 'direccion',
          select: '-_id'
        }, {
          path: 'direccion.state_id',
          select: '-__v',
          model: 'State'
        }, {
          path: 'direccion.municipality_id',
          select: '-__v -_id',
          model: 'Municipality'
        }, {
          path: 'direccion.locality_id',
          select: '-__v -_id',
          model: 'Locality'
        }]
      }, {
        path: 'patient',
        select: '-__v -rol -fecha_creacion -birthdate_as_iso_date -client_creation_iso_date',
        model: 'Patient',
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
          path: 'direccion',
          select: '-_id'
        }, {
          path: 'direccion.state_id',
          select: '-__v',
          model: 'State'
        }, {
          path: 'direccion.municipality_id',
          select: '-__v -_id',
          model: 'Municipality'
        }, {
          path: 'direccion.locality_id',
          select: '-__v -_id',
          model: 'Locality',
        },
        {
          path: 'tutor.person',
          select: '-__v',
          populate: {
            path: 'user',
            select: 'first_name father_surname mother_surname curp direccion',
            model: 'Tutor',
          }
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
    model: 'Doctor',
    populate: [{
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
      path: 'direccion',
      select: '-_id',
    }, {
      path: 'direccion.state_id',
      select: '-__v',
      model: 'State'
    }]
  }];

  next();
};


exports.update = function(req, res, next) {
  User.findOne({_id: req.object._id}, function(err, user) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    } else {
      Model.findOne({_id: user.user}, function(err, doctor) {
        if (err) {
          return res.status(400).send({
            success: false,
            message: tools.getErrorMessage(err)
          });
        } else {
          var modified = new Date();

          doctor.direccion = [];
          if (Array.isArray(req.body.direccion)) {
            for (var i = 0; i < req.body.direccion.length; i++) {
              doctor.direccion.push(req.body.direccion[i]);
            }
          }

          doctor.birthdate = req.body.birthdate;
          doctor.birthplace = req.body.birthplace;
          doctor.client_creation_date = req.body.client_creation_date;

          doctor.clinic = [];
          if (req.body.clinic !== undefined) {
            if (Array.isArray(req.body.clinic)) {
              for (var i = 0; i < req.body.clinic.length; i++) {
                doctor.clinic.push(req.body.clinic[i]);
              }
            } else {
              doctor.clinic.push(req.body.clinic);
            }
          }

          doctor.country_id = req.body.country_id;
          doctor.curp = req.body.curp;
          doctor.father_surname = req.body.father_surname;
          doctor.first_name = req.body.first_name;
          doctor.gender = req.body.gender;
          doctor.modified = modified;
          doctor.mother_surname = req.body.mother_surname;

          doctor.patient = [];
          if (req.body.patient !== undefined) {
            if (Array.isArray(req.body.patient)) {
              for (var i = 0; i < req.body.patient.length; i++) {
                doctor.patient.push(req.body.patient[i]);
              }
            } else {
              doctor.patient.push(req.body.patient);
            }
          }

          doctor.phones = [];
          if (Array.isArray(req.body.phones)) {
            for (var i = 0; i < req.body.phones.length; i++) {
              doctor.phones.push(req.body.phones[i]);
            }
          }

          doctor.professional_license = req.body.professional_license;
          doctor.rfc = req.body.rfc;

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
          description:"Modificación de Medico"
        });
          user.save(function(err) {
            if (err) {
              return res.send({
                success: false,
                message: tools.getErrorMessage(err)
              });
            }
          
            doctor.save(function(err) {
              if (err) {
                return res.send({
                  success: false,
                  message: tools.getErrorMessage(err)
                });
              }
    
              return res.send({
                success: true,
                message: 'Doctor modificado exitosamente'
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

  deletedUser.user.direccion = req.object.user.direccion;
  deletedUser.user.birthdate = req.object.user.birthdate;
  deletedUser.user.birthdate_as_iso_date = req.object.user.birthdate_as_iso_date;
  deletedUser.user.birthplace = req.object.user.birthplace;
  deletedUser.user.client_creation_date = req.object.user.client_creation_date;
  deletedUser.user.client_creation_iso_date = req.object.user.client_creation_iso_date;
  deletedUser.user.clinic = req.object.user.clinic;
  deletedUser.user.country_id = req.object.user.country_id;
  deletedUser.user.curp = req.object.user.curp;
  deletedUser.user.father_surname = req.object.user.father_surname;
  deletedUser.user.first_name = req.object.user.first_name;
  deletedUser.user.gender = req.object.user.gender;
  deletedUser.user.mother_surname = req.object.user.mother_surname;
  deletedUser.user.patient = req.object.user.patient;
  deletedUser.user.phones = req.object.user.phones;
  deletedUser.user.professional_license = req.object.user.professional_license;
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
          description:"Eliminacion de Medico"
        });

  next();
};
