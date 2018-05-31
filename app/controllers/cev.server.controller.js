var mongoose = require('mongoose');

var User = mongoose.model('detalle_usuario');
var Tutor = mongoose.model('responsables');
var Cev = mongoose.model('Cev');
var Affiliation = mongoose.model('Affiliation');
var VaccinesControl = mongoose.model('VaccinesControl');
var Patient = mongoose.model('Patient');
var trashModel = mongoose.model('DeletedUser');

var Data = require('../models/data.server.model');
var tools = require('./tools.server.controller');
var crud = require('./crud.server.controller');
var config = require('../../config/config');

var SuburbType = mongoose.model('SuburbType');
var StreetType = mongoose.model('StreetType');

var Client = require('node-rest-client').Client;

exports.getCev = function(req, res, next) {
  if (!true) {
    return res.json({
      success: false,
      message: Data.msgRequired('id')
    });
  }

  if (!true) {
    return res.json({
      success: false,
      message: Data.msgRequired('fecha de nacimiento')
    });
  }

  var client = new Client();
  var args = {
    data: {
      masked_id: req.body.masked_id,
      birthdate: req.body.birthdate
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };

  client.post(config.cevEndpoint, args, function(data, response) {
   
    if (data) {
      if (data.errorCode === 500) {
        return res.send({
          success: false,
          message: 'Error interno del servidor. Inténtelo más tarde'
        });
      }

      if (data.errorCode === 404) {
        return res.send({
          success: false,
          message: 'Servicio no disponible. Inténtelo más tarde'
        });
      }

      if (data.errorCode === 204) {
        return res.send({
          success: false,
          message: 'Identificador/Fecha de nacimento no válidos'
        });
      }

      if (!data.searchedPersonsMask) {
        return res.send({
          success: false,
          message: 'Servicio no disponible'
        });
      }

      req.patient = tools.convertCevToProtegelos(data.searchedPersonsMask[0], {});

      if ( !req.patient.tutor ) {
        return res.status(400).send({
          success: false,
          message: "Este menor no tiene asociados responsables"
        });
      }

      req.vaccines = req.patient.vaccines;
      next();
    }

  });
};

exports.checkIfExtist = function(req, res, next) {
  Cev.findOne({
    masked_id: req.patient.patient.cev_id
  }, function(err, cevSavedPatient) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }

    if ( cevSavedPatient ) {
      req.cev_id = cevSavedPatient;
      next();
    } else {
      cevSavedPatient = new Cev({
        masked_id:req.patient.patient.cev_id
      });
      cevSavedPatient.save(function(err, savedObject) {
        if (err) {
          return res.status(400).send({
            success: false,
            message: tools.getErrorMessage(err)
          });
        }
        req.cev_id = savedObject;
        getAffiliation(req, res, next);
      });
    }
  });
};
var getAffiliation = function(req, res, next){
  Affiliation.findOne({
    _id: req.patient.patient.affiliations[0].affiliation
  }, function(err, object) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }
    req.affiliation = object.name;
    verifyRole(req, res, next);
  });
};

var verifyRole = function(req, res, next){
  if ( req.decoded.rol != "tutor" ) {
    User.findOne({correo: req.patient.tutor[0].father_surname + "." +
      req.patient.tutor[0].client_creation_date + "@cev.com"})
      .select('-__v -fecha_creacion')
      .exec(function(err, object) {
        // var tutors = [];
        if ( !object ) {
          createTutor(req, res, next);
        } else {
          req.tutorID = object._id;
          getSuburbtype(req, res, next);
        }
      });
  } else {
    getSuburbtype(req, res, next);
  }
};

var createTutor = function(req, res, next){
  var tutor = {
    birthdate: req.patient.tutor[0].birthdate,
    birthplace: req.patient.tutor[0].birthplace,
    client_creation_date: req.patient.tutor[0].client_creation_date,
    country_id: req.patient.tutor[0].country_id,
    curp: req.patient.tutor[0].curp || "XXXXXXXXXXXXXXXX",
    father_surname: req.patient.tutor[0].father_surname,
    first_name: req.patient.tutor[0].first_name,
    gender: req.patient.tutor[0].gender,
    mother_surname: req.patient.tutor[0].mother_surname
  };
  tutor = new Tutor(tutor);
  tutor.save(function(err, tutor) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }
    var user = {
      correo: req.patient.tutor[0].father_surname + "." +
        req.patient.tutor[0].client_creation_date + "@cev.com",
      contrasena: "uohipjWJMCT3Qltf5A9Ziw==",
      rol: "tutor",
      user: tutor._id
    };
    user = new User(user);
    user.save(function(err, user) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      }
      req.tutorID = user._id;
      getSuburbtype(req, res, next);
    });
  });
};

var getSuburbtype = function(req, res, next){
  SuburbType.find()
    .select('-__v -fecha_creacion')
    .exec(function(err, object) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      }
      req.suburb_type = object;
      getStreettype(req, res, next);
    });
};
var getStreettype = function(req, res, next){
  StreetType.find()
    .select('-__v -fecha_creacion')
    .exec(function(err, object) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      }
      req.street_type = object;
      fixAddress(req, res, next);
    });
};

var fixAddress = function(req, res, next){
  var addresses = req.patient.address;
  var address = {};
  var fixedAddress = [];
  var i,j;
  for ( i = 0; i < addresses.length; i++) {
    address = addresses[i];

    if ( address.suburb_type ) {
      for ( j = 0; j < req.suburb_type.length; j++) {
        if ( address.suburb_type == req.suburb_type[j]._id ) {
          address.suburb_type = req.suburb_type[j].name;
        }
      }
    }
    if ( address.street_type ) {
      for ( j = 0; j < req.street_type.length; j++) {
        if ( address.street_type == req.street_type[j]._id ) {
          address.street_type = req.street_type[j].name;
        }
      }
    }
    fixedAddress.push( address );
  }
  req.fixedAddress = fixedAddress;
  savePatient(req, res, next);
};

var savePatient = function(req, res, next){
  var tutor = req.decoded.id;
  if ( req.decoded.rol != "tutor" ) {
    tutor = req.tutorID;
  }
  var patient = {
    address: req.fixedAddress || [],
    affiliation: req.affiliation,
    affiliation_number: req.patient.patient.affiliations[0].affiliationnumber,
    birthdate: req.patient.birthdate,
    birthplace: req.patient.birthplace,
    cev_id: req.cev_id._id,
    client_creation_date: req.patient.client_creation_date,
    country_id: req.patient.country_id,
    curp: req.patient.curp,
    father_surname: req.patient.father_surname,
    mother_surname: req.patient.mother_surname,
    first_name: req.patient.first_name,
    gender: req.patient.gender,
    rfc: req.patient.rfc,
    tutor: [{
      kinship: "OTRO",
      person: tutor
    }]
  };
  patient = new Patient(patient);
  patient.save(function(err, savedObject) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }
    req.patient = savedObject;
    next();
  });
};

exports.getPatient = function(req, res, next) {
  var populate = [
    {
      path: 'cev_id',
      select: '-__v -fecha_creacion -__id',
      model: 'Cev'
    },
    {
      path: 'birthplace',
      select: '-__v -fecha_creacion -__id',
      model: 'State'
    },
    {
      path: 'country_id',
      select: '-__v -fecha_creacion -__id',
      model: 'Country'
    },
    {
      path: 'address.state_id',
      select: '-__v -fecha_creacion',
      model: 'State',
      populate:[
        {
          path: 'state_id',
          model: 'State'
        }
      ]
    },
    {
      path: 'address.municipality_id',
      select: '-__v -fecha_creacion',
      model: 'Municipality',
      populate:[
        {
          path: 'municipality_id',
          model: 'Municipality'
        }
      ]
    },
    {
      path: 'address.locality_id',
      select: '-__v -fecha_creacion',
      model: 'Locality',
      populate:[
        {
          path: 'locality_id',
          model: 'Locality'
        }
      ]
    }
  ];
  Patient.findOne({cev_id: req.cev_id})
    .populate(populate)
    .exec(function(err, object) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      }
      if ( !object ) {
        getAffiliation(req, res, next);
      } else {
        req.patient = object;
        next();
      }
    }
  );
};

exports.getVaccines = function(req, res, next){
  var populate = [
    {
      path: 'vaccine',
      select: '-__v -fecha_creacion -__id',
      model: 'Vaccine'
    },
    {
      path: 'dosage',
      select: '-__v -fecha_creacion -__id',
      model: 'DosageVaccine'
    },
    {
      path: 'vaccine.administration_route',
      select: '-__v -fecha_creacion',
      model: 'AdministrationRoute',
      populate:[
        {
          path: 'vaccine.administration_route',
          model: 'AdministrationRoute'
        }
      ]
    },
  ];
  VaccinesControl.find({patient: req.patient})
    .populate(populate)
    .select("-__v -fecha_creacion")
    .exec(function(err, object) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      }
      req.vaccines2 = object || [];
      next();
    }
  );
};

exports.updateVaccines = function(req, res, next) {
  if ( req.vaccines ) {
    if ( req.vaccines.length === 0 ) {
      next();
    } else {
      var actualVaccines = req.vaccines2;
      var cevVaccines = req.vaccines;
      var vaccionesToSave = [];

      if ( actualVaccines.length === 0 ) {
        vaccionesToSave = cevVaccines;
      } else {
        for( var i = 0; i < cevVaccines.length; i++) {
          var isOnActual = false;
          var vaccine = {};
          for ( var j = 0; j < actualVaccines.length; j++) {
            vaccine = cevVaccines[i];
            if( actualVaccines[j].vaccine._id == cevVaccines[i].vaccine) {
               // if(actualVaccines[j].dosage._id !== null){
                 // if(actualVaccines[j].dosage._id == cevVaccines[i].dosage){
                    //actualVaccines[j].dosage._id);
                    isOnActual = true;
                    break;
                  //}
                  
                //}
                
               
            }
          }
          if( !isOnActual ) {
            vaccionesToSave.push(vaccine);
          }

        }
      }
      req.vaccines = vaccionesToSave;
      var total = req.vaccines.length;

      // for ( i = 0; i < vaccionesToSave.length; i++) {
      //   req.vaccines2
      // }

      if( total === 0) {
        next();
      } else {
        saveVaccines(req, res, next, total, req.vaccines);
      }
    }
  } else {
    next();
  }
};

var saveVaccines = function(req, res, next, total, vaccines){
  var doc = vaccines.pop();
  doc = new VaccinesControl({
    patient:req.patient._id,
    vaccine:doc.vaccine,
    dosage:doc.dosage,
    application_date:doc.application_date,
    serial:doc.serial,
    expiration:doc.expiration
  });
  doc.save(function(err, saved){
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }
    if (--total) {
      saveVaccines(req, res, next, total, vaccines);
    }
    else {
      next();
    }
  });
};

exports.getTutor = function(req, res, next) {
  var populate = [{
    path: 'user',
    select: '-__v -fecha_creacion',
    model: 'Tutor'
  }];
  var tutor = req.decoded.id;
  
  if ( req.decoded.rol != "tutor" ) {
    tutor = req.patient.tutor[0].person;
  }
  User.findById(tutor)
    .select('-__v -fecha_creacion')
    .populate(populate)
    
    .exec(function(err, object) {
      var tutors = [];
      if(object===null){
        var tutors = [];
      }else{
        tutors.push({
          person:object,
        kinship:object.user.patient.kinship || "OTRO"
        //   "OTRO"
        });
      }
      
      return res.send({
        success: true,
        message: "Información CEV",
        data:{
          _id:req.patient._id,
          client_creation_date:req.patient.client_creation_date,
          first_name:req.patient.first_name,
          father_surname:req.patient.father_surname,
          mother_surname:req.patient.mother_surname,
          rfc:req.patient.rfc,
          curp:req.patient.curp,
          affiliation:req.patient.affiliation,
          birthdate:req.patient.birthdate,
          gender:req.patient.gender,
          phones:req.patient.phones,
          cev_id:req.patient.cev_id,
          birthplace:req.patient.birthplace,
          tutor:tutors,
          doctor:req.patient.doctor,
          address:req.patient.address,
          country_id:req.patient.country_id,
          vaccines:req.vaccines2
        }
      });
    }
  );
};
