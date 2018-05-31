// Invoke 'strict' JavaScript mode
'use strict';


var Schema = 'VaccinesControl';

var mongoose = require('mongoose');
var Model = mongoose.model(Schema);
var User = mongoose.model('detalle_usuario');
var trashModel = mongoose.model('Deleted'+Schema);
var crud = require('./crud.server.controller');
var Tools = require('./tools.server.controller');


var populate = [{
  path: 'patient',
  select: '-__v -fecha_creacion -rol -birthdate_as_iso_date ' +
    '-client_creation_iso_date',
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
    path: 'tutor',
    select: '-_id'
  }, {
    path: 'tutor.person',
    select: '-__v -birthdate_as_iso_date -client_creation_iso_date -fecha_creacion ' +
      '-patient',
    model: 'User',
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
    }]
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
  }]
}, {
  path: 'vaccine',
  select: '-__v -fecha_creacion',
  model: 'Vaccine',
  populate: [{
    path: 'administration_route',
    model: 'AdministrationRoute'
  }]
}, {
  path: 'dosage',
  select: '-__v -fecha_creacion',
  model: 'DosageVaccine'
}, {
  path: 'clinic',
  select: '-__v -fecha_creacion',
  model: 'Clinic',
  populate: [{
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
  }]
}, {
  path: 'doctors',
  select: '-__v -rol -fecha_creacion -birthdate_as_iso_date ' +
    '-client_creation_iso_date',
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
  }]
}];

var select = '-__v -fecha_creacion';
   

exports.create = function(req, res, next) {

  var DoctorPopulate = [{
    path: 'user',
    select: '-__v -birthdate_as_iso_date -client_creation_iso_date -fecha_creacion',
    model: 'Doctor'
  }];

  Model.find({patient: req.body.patient})
    .populate(populate)
    .lean()
    .exec(function(err, object) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: Tools.getErrorMessage(err)
        });
      }

      User.findOne({_id: req.body.doctors}).
      populate(DoctorPopulate)
      .exec(function (err, doctor) {
        if (err) {
          return res.json({
            success: false,
            message: Tools.getErrorMessage(err)
          });

        } else {
          if(!doctor) {
            return res.json({
              success: false,
              message: 'Registro no encontrado'
            });
          } else {

            if (doctor.user.patient.indexOf(req.body.patient) < 0){
              return res.json({
                success: false,
                message: "Menor no relacionado al doctor."
              });
            }

            var applied = false;
            for (var i = 0; i < object.length; i++) {
              if ( req.body.dosage == object[i].dosage._id &&
                  Number(object[i].dosage.column)!=5 ) {
                applied = true;
              }
            }

            if (applied) {
              return res.status(400).send({
                success: false,
                message: 'Error: Esta dósis ya ha sido aplicada a este menor'
              });
            }

            if (!req.body.doctors){
              return res.status(400).send({
                success: false,
                message: 'Error: debe especificar por lo menos un doctor'
              });
            }

            req.object = new Model(req.body);
            
            next();

          }

        }

      });

    }
  );
}

exports.findOne = function(req, res, next, id) {
  if (req.method === 'DELETE') {
    populate = '';  // Avoid populate object for soft-deleting
    select = '';
  } else {
    populate = [{
      path: 'patient',
      select: '-__v -fecha_creacion -rol -birthdate_as_iso_date ' +
        '-client_creation_iso_date',
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
        path: 'tutor',
        select: '-_id'
      }, {
        path: 'tutor.person',
        select: '-__v -birthdate_as_iso_date -client_creation_iso_date ' +
          '-fecha_creacion -patient',
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
        }]
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
      }]
    }, {
      path: 'vaccine',
      select: '-__v -fecha_creacion',
      model: 'Vaccine',
      populate: [{
        path: 'administration_route',
        model: 'AdministrationRoute'
      }]
    }, {
      path: 'dosage',
      select: '-__v -fecha_creacion',
      model: 'DosageVaccine'
    }, {
      path: 'clinic',
      select: '-__v -fecha_creacion',
      model: 'Clinic',
      populate: [{
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
      }]
    }, {
      path: 'doctors',
      select: '-__v -rol -fecha_creacion -birthdate_as_iso_date ' +
        '-client_creation_iso_date',
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
      }]
    }];
    
    select = '-__v -fecha_creacion';
  }

  Model.findById(id)
    .select(select)
    .populate(populate)
    .exec(function(err, object) {
      crud.oneObjectById(req, res, err, object, next);
    });
};


exports.readOne = function(req, res, next) {
  var data = {};
  data._id = req.object._id;
  data.patient = req.object.patient;
  data.doctors = req.object.doctors;
  data.vaccine = req.object.vaccine;
  data.dosage = req.object.dosage;
  data.clinic = req.object.clinic;
  data.application_date = req.object.application_date;

  if (req.object.observations) {
    data.observations = req.object.observations;
  }

  if (req.object.serial) {
    data.serial = req.object.serial;
  }

  if (req.object.expiration) {
    data.expiration = req.object.expiration;
  }

  if (req.object.color) {
    data.color = req.object.color;
  }

  if (req.object.fecha_creacion) {
    data.fecha_creacion = req.object.fecha_creacion;
  }

  return res.send({
    success: true,
    data: data
  });
};


exports.readAll = function(req, res, next) {
  req.model = Model;
  req.populate = populate;
  req.select = '-__v -fecha_creacion -application_iso_date -expiration_iso_date';

  next();
};


exports.getPatientId = function(req, res, next, id) {
  req.object = {};
  req.object.patientId = id;
  next();
};


exports.readAllByPatientId = function(req, res, next) {
  User.findById(req.object.patientId)
  .select('-__v -fecha_creacion')
  .exec(function(err, object) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: 'Usuario no registrado'
      });
    }
    Model.find({
        'patient':req.object.patientId
      })
      .populate(populate)
      .lean()
      .exec(function(err, object) {
        if (err) {
          return res.status(400).send({
            success: false,
            message: Tools.getErrorMessage(err)
          });
        }
        return res.json({
          success: true,
          data: object
        });
      }
    );
  });
};


exports.update = function(req, res, next) {
  if (req.body.patient) {
    req.object.patient = req.body.patient;
  }

  if (req.body.doctors) {
    req.object.doctors = req.body.doctors;
  }

  if (req.body.vaccine) {
    req.object.vaccine = req.body.vaccine;
  }

  if (req.body.dosage) {
    req.object.dosage = req.body.dosage;
  }

  if (req.body.clinic) {
    req.object.clinic = req.body.clinic;
  }

  if (req.body.application_date) {
    req.object.application_date = req.body.application_date;
  }

  if (req.body.observations) {
    req.object.observations = req.body.observations;
  }

  if (req.body.serial) {
    req.object.serial = req.body.serial;
  }

  if (req.body.expiration) {
    req.object.expiration = req.body.expiration;
  }

  if (req.body.color) {
    req.object.color = req.body.color;
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
  // It's required to copy the req.object element by element instead of only
  // change it to the trash model in order to avoid the error:
  // 'VersionError: No matching document found for id'
  var deletedVaccinesControl = {};

  if (req.object.patient) {
    deletedVaccinesControl.patient = req.object.patient;
  }

  if (req.object.doctors) {
    deletedVaccinesControl.doctors = req.object.doctors;
  }

  if (req.object.vaccine) {
    deletedVaccinesControl.vaccine = req.object.vaccine;
  }

  if (req.object.dosage) {
    deletedVaccinesControl.dosage = req.object.dosage;
  }

  if (req.object.clinic) {
    deletedVaccinesControl.clinic = req.object.clinic;
  }

  if (req.object.application_date) {
    deletedVaccinesControl.application_date = req.object.application_date;
  }

  if (req.object.observations) {
    deletedVaccinesControl.observations = req.object.observations;
  }

  if (req.object.serial) {
    deletedVaccinesControl.serial = req.object.serial;
  }

  if (req.object.expiration) {
    deletedVaccinesControl.expiration = req.object.expiration;
  }

  if (req.object.color) {
    deletedVaccinesControl.color = req.object.color;
  }

  req.oldObject = req.object;
  req.object = new trashModel(deletedVaccinesControl);
  req.trash = true;

  next();
};
