// Invoke 'strict' JavaScript mode
'use strict';


// Load 'Patient' Mongoose model
var mongoose = require('mongoose');
var Model = mongoose.model('Patient');
var crud = require('./crud.server.controller');
var tools = require('./tools.server.controller');
var trashModel = mongoose.model('DeletedPatient');
var Bitacora=mongoose.model('Binnacleuser');

// Create a new 'create' controller method
exports.create = function(req, res, next) {

  // If is given a tutor info is necesary fecha_creacion.
  if (req.body.tutor.length > 0 && req.body.tutor[0].person.rol === "tutor") {
    var TutorModel = mongoose.model('responsables');
    var UserModel = mongoose.model('detalle_usuario');
    req.object = new TutorModel({
      birthdate: req.body.tutor[0].person.birthdate,
      birthplace: req.body.tutor[0].person.birthplace,
      client_creation_date: req.body.tutor[0].person.client_creation_date,
      country_id: req.body.tutor[0].person.country_id,
      curp: req.body.tutor[0].person.curp,
      father_surname: req.body.tutor[0].person.father_surname,
      first_name: req.body.tutor[0].person.first_name,
      gender: req.body.tutor[0].person.gender,
      mother_surname: req.body.tutor[0].person.mother_surname,
      phones: req.body.tutor[0].person.phones,
      rfc: req.body.tutor[0].person.rfc
    });

    


    req.object.save(function(err) {
      if (err) { 
        return res.send({
          success: false,
          message: err
        });
      }
    });

    req.user = new UserModel({
      correo: req.body.tutor[0].person.client_creation_date.toString() + "@protegelos.com",
      contrasena: "uohipjWJMCT3Qltf5A9Ziw==",
      rol: req.body.tutor[0].person.rol,
      user: req.object._id
    });

    req.user.save(function(err) {
      if (err) { 
        return res.send({
          success: false,
          message: err.errmsg
        });
      }

    });
  
    req.body.tutor[0].person = {
    '_id': req.user._id
    };
  
  }

  req.object = new Model(req.body);

  req.bitacora=new  Bitacora({
    origin:1,
    origin_update:1,
    validated:1,
    date_update:req.body.client_creation_date,
    user:req.object._id,
    description:"Alta de Vacunado"
  });

  req.bitacora.save(function(err) {
    if (err) { 
      return res.send({
        success: false,
        message: err.errmsg
      });
    }

  });
  next();
};


exports.findOne = function(req, res, next, id) {
  if (req.method === 'DELETE') {

    var select = '';
    var populate = '';  // Avoid populate object for soft-deleting

  } else {

    select = '-__v -fecha_creacion -birthdate_as_iso_date -client_creation_iso_date';

    var populate = [{
      path: 'cev_id',
      select: '-_id -__v -fecha_creacion',
      model: 'Cev'
    }, {
      path: 'country_id',
      select: '-__v',
      model: 'Country'
    }, {
      path: 'birthplace',
      select: '-__v',
      model: 'State'
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
      path: 'doctor',
      select: '-__v -fecha_creacion -rol',
      model: 'User',
      populate: [{
        path: 'user', 
        select: '-__v -fecha_creacion -birthdate_as_iso_date ' +
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
          path: 'phones',
          select: '-_id'
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
    }, {
      path: 'tutor',
      select: '-_id'
    }, {
      path: 'tutor.person',
      select: '-__v -fecha_creacion -rol',
      model: 'User',
      populate: [{
        path: 'user', 
        select: '-__v -fecha_creacion -birthdate_as_iso_date ' +
          '-client_creation_iso_date',
        model: 'Tutor',
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

  Model.findById(id)
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
  req.model = null;
  req.subModel = Model;
  
  req.select = 'father_surname mother_surname first_name curp cev_id address';
  req.populate = [{
    path: 'cev_id',
    select: 'masked_id',
    model: 'Cev'
  },{
    path: 'address',
    select: '-_id'
  }, {
    path: 'address.state_id',
    select: '-__v',
    model: 'State'
  }];


  next();
};


exports.update = function(req, res, next) {
  Model.findOne({_id: req.object._id}, function(err, patient) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }

    // The conditions are added because without them this method will be an
    // simply insert
    if (req.body.address) {
      // Empty the array and insert the data again because the locality_id is
      // mapped
      patient.address = [];
      if (Array.isArray(req.body.address)) {
        for (var i = 0; i < req.body.address.length; i++) {
          patient.address.push(req.body.address[i]);
        }
      }
    }

    if (req.body.affiliation) {
      patient.affiliation = req.body.affiliation;
    }

    if (req.body.affiliation_number) {
      patient.affiliation_number = req.body.affiliation_number;
    }
    
    if (req.body.birthdate) {
      patient.birthdate = req.body.birthdate;
    }

    if (req.body.birthplace) {
      patient.birthplace = req.body.birthplace;
    }

    if (req.body.blood_type) {
      patient.blood_type = req.body.blood_type;
    } 

    if (req.body.client_creation_date) {
      patient.client_creation_date = req.body.client_creation_date;
    }

    if (req.body.country_id) {
      patient.country_id = req.body.country_id;
    }

    if (req.body.curp) {
      patient.curp = req.body.curp;
    }

    if (req.body.father_surname) {
      patient.father_surname = req.body.father_surname;
    }

    if (req.body.first_name) {
      patient.first_name = req.body.first_name;
    }

    if (req.body.gender) {
      patient.gender = req.body.gender;
    }

    if (req.body.masked_id) {
      patient.masked_id = req.body.masked_id;
    }

    if (req.body.medical_record) {
      patient.medical_record = req.body.medical_record;
    }

    if (req.body.mother_surname) {
      patient.mother_surname = req.body.mother_surname;
    }

    if (req.body.phones) {
      patient.phones = [];
      if (Array.isArray(req.body.phones)) {
        for (var i = 0; i < req.body.phones.length; i++) {
          patient.phones.push(req.body.phones[i]);
        }
      }
    }

    if (req.body.rfc) {
      patient.rfc = req.body.rfc;
    }

    if (req.body.tutor) {
      patient.tutor = [];
      if (req.body.tutor !== undefined) {
        if (Array.isArray(req.body.tutor)) {
          for (var i = 0; i < req.body.tutor.length; i++) {
            patient.tutor.push(req.body.tutor[i]);
          }
        } else {
          patient.tutor.push(req.body.tutor);
        }
      }
    }

    if (req.body.doctor) {
      patient.doctor = [];
      if (req.body.doctor !== undefined) {
        if (Array.isArray(req.body.doctor)) {
          for (var i = 0; i < req.body.doctor.length; i++) {
            patient.doctor.push(req.body.doctor[i]);
          }
        } else {
          patient.doctor.push(req.body.doctor);
        }
      }
    }

    req.bitacora=new  Bitacora({
      origin:1,
      origin_update:1,
      validated:1,
      date_update:req.body.client_creation_date,
      user:req.object._id,
      description:"Actualizacion de Vacunado"
    });
  
    req.bitacora.save(function(err) {
      if (err) { 
        return res.send({
          success: false,
          message: err.errmsg
        });
      }
  
    });

    patient.modified = new Date();

    req.object = patient;
    req.finish = true;


    
    next();
  });
};


exports.delete = function(req, res, next) {
  // It's required to copy the req.object element by element instead of only 
  // change it to the trash model in order to avoid the error:
  // 'VersionError: No matching document found for id' 
  var deletedPatient = {};

  deletedPatient.address = req.object.address;
  deletedPatient.affiliation = req.object.affiliation;
  deletedPatient.affiliation_number = req.object.affiliation_number;
  deletedPatient.birthdate = req.object.birthdate;
  deletedPatient.birthdate_as_iso_date = req.object.birthdate_as_iso_date;
  deletedPatient.birthplace = req.object.birthplace;
  deletedPatient.blood_type = req.object.blood_type;
  deletedPatient.cev_id = req.object.cev_id;
  deletedPatient.client_creation_date = req.object.client_creation_date;
  deletedPatient.client_creation_iso_date = req.object.client_creation_iso_date;
  deletedPatient.country_id = req.object.country_id;
  deletedPatient.curp = req.object.curp;
  deletedPatient.father_surname = req.object.father_surname;
  deletedPatient.first_name = req.object.first_name;
  deletedPatient.gender = req.object.gender;
  deletedPatient.medical_record = req.object.medical_record;
  deletedPatient.mother_surname = req.object.mother_surname;
  deletedPatient.phones = req.object.phones;
  deletedPatient.rfc = req.object.rfc;
  deletedPatient.tutor = req.object.tutor;
  deletedPatient.fecha_creacion = req.object.fecha_creacion;
  deletedPatient.modified = req.object.modified;

  req.oldObject = req.object;
  req.object = new trashModel(deletedPatient);
  req.trash = true;
  req.bitacora=new  Bitacora({
    origin:1,
    origin_update:1,
    validated:1,
    date_update:req.body.client_creation_date,
    user:req.object._id,
    correo:req.object.tutor.correo,
    description:"Eliminacion de Vacunado"
  });
  next();
};
