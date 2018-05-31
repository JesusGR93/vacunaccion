// Invoke 'strict' JavaScript mode
'use strict';


// Load dependencies
var Data = require('./data.server.model.js');
var Person = require('./person.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var patient = {
  type: Schema.ObjectId,
  ref: 'Patient',
  validate: [
    function (patient, callback) {
      var Patient = mongoose.model('Patient');

      Patient.findOne({ _id: patient }, function (err, user) {
        if (err || !user) {
          callback(false);
        }

        callback(true);
      });
    },
    Data.msgValidFormat('Menor')
  ]
};


// Defined doctor's schema
var TutorSchema = new Schema({
  // address: Data.address,
  nombre: Person.nombre,
  primer_apellido: Person.primer_apellido,
  segundo_apellido: Person.segundo_apellido,
  id_nacionalidad: Person.id_nacionalidad,
  id_estado_nacimiento: Person.id_estado_nacimiento,
  id_origen_registro:{
    type:String
  },
  sexo: Person.sexo,
  curp: Person.curp,
  correo:Person.correo,
  fecha_nacimiento: Person.fecha_nacimiento,
  fecha_registro_app: Person.fecha_registro_app,
  fecha_registro: Person.fecha_registro,
  fecha_ultima_modificacion: Person.fecha_ultima_modificacion,
  fecha_validacion:{
    type:Date
  },
  estado_autorizacion:{
    type: Number
  },
  id_direccion: Person.id_direccion
});


// Create fields as ISO Date
TutorSchema.pre('save', function (next) {
  var user = this;

  if (user.client_creation_date) {
    user.client_creation_iso_date = user.client_creation_date;
  }

  user.birthdate_as_iso_date = user.birthdate;

  next();
});


TutorSchema.pre('save', function (next) {
  var UserModel = mongoose.model('detalle_usuario');
  var PatientModel = mongoose.model('Patient');
  var newTutor = this;

  var tutorPopulate = [{
    path: 'user',
    select: 'patient',
    model: 'Tutor'
  }];

  UserModel.findOne({ 'user': newTutor._id })
    .populate(tutorPopulate)
    .exec(function (err, oldTutor) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      } else {

        var band;

        if (oldTutor && oldTutor.user && newTutor.patient &&
          oldTutor.user.patient.length > newTutor.patient.length) {

          for (var i = 0; i < oldTutor.user.patient.length; i++) {
            band = false;

            var j;
            for (j = 0; j < newTutor.patient.length; j++) {
              if (oldTutor.user.patient[i].person.toString() === newTutor.patient[j].person.toString()) {
                band = true;
                break;
              }
            }

            if (band == false) {
              var id = oldTutor.user.patient[i].person;

              PatientModel.findById({ _id: oldTutor.user.patient[i].person },
                function (error, doc) {
                  if (err) {
                    return res.status(400).send({
                      success: false,
                      message: tools.getErrorMessage(err)
                    });
                  } else {
                    var result = doc.tutor.filter(function (obj) {
                      return obj.person.toString() !== oldTutor._id.toString();
                    });

                    doc.tutor = result;
                    doc.update(doc).exec();
                  }
                }
              );
            }

          }

        }

        if (newTutor.client_creation_date) {
          newTutor.client_creation_iso_date = newTutor.client_creation_date;
        }

        newTutor.birthdate_as_iso_date = newTutor.birthdate;
        next();
      }

    });

});


TutorSchema.pre('save', function (next) {
  var tutor = this;

  if (tutor.address.length > 0) {
    var Municipality = mongoose.model('Municipality');
    var Locality = mongoose.model('Locality');
    var j = 0;

    for (var i = 0; i < tutor.address.length; i++) {
      var address = tutor.address[i];
      var params = {
        state_id: address.state_id,
        municipality_id: address.municipality_id,
        id: address.locality_id
      };

      Locality.findOne(params, function (err, locality) {
        if (err) {
          return res.status(400).send({
            success: false,
            message: tools.getErrorMessage(err)
          });
        }

        for (var x = 0; x < tutor.address.length; x++) {
          if (tutor.address[x].locality_id == locality.id) {
            tutor.address[x].locality_id = locality._id;
          }
        }

        var params = {
          state_id: locality.state_id,
          id: locality.municipality_id
        };

        Municipality.findOne(params, function (err, municipality) {
          if (err) {
            return res.status(400).send({
              success: false,
              message: tools.getErrorMessage(err)
            });
          }

          for (var x = 0; x < tutor.address.length; x++) {
            if (tutor.address[x].municipality_id == municipality.id) {
              tutor.address[x].municipality_id = municipality._id;
            }
          }

          j++;
          if (j === tutor.address.length) {
            next();
          }
        });
      });
    }
  } else {
    next();
  }
});


// Link the tutor with patient
TutorSchema.post('save', function (tutor) {
  var Patient = mongoose.model('Patient');
  var User = mongoose.model('detalle_usuario');

  // Add patient in tutor
  User.findOne({ user: tutor._id }, function (err, tutorUser) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }

    for (var i = 0; i < tutor.patient.length; i++) {
      var kinship = tutor.patient[i].kinship;

      Patient.findOne({ _id: tutor.patient[i].person }, function (err, patient) {
        if (err) {
          return res.status(400).send({
            success: false,
            message: tools.getErrorMessage(err)
          });
        }

        var tutors = patient.tutor.map(function (object) { return object.person.toString(); });

        if (tutors.indexOf(tutorUser._id.toString()) === -1) {
          patient.tutor.push({ kinship: kinship, person: tutorUser._id });
        }

        Patient.findOneAndUpdate({ _id: patient._id },
          { $set: { tutor: patient.tutor } }, function (err) {
            if (err) {
              return res.status(400).send({
                success: false,
                message: tools.getErrorMessage(err)
              });
            }
          });

      });
    }

  });

});


// Create the 'Tutor' model out of the 'TutorSchema'
mongoose.model('responsables', TutorSchema);
