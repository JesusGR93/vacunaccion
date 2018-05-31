// Invoke 'strict' JavaScript mode
'use strict';


// Load dependencies
var Data = require('./data.server.model');
var Person = require('./person.server.model');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var affiliation = {
  type: String,
  maxlength: 50,
  trim: true,
  required: Data.msgRequired('Afiliación'),
  validate: [
    function (affiliation, callback) {
      var Affiliation = mongoose.model('Affiliation');

      Affiliation.findOne({ name: affiliation }, function (err, object) {

        if (err || !object) {
          callback(false);
        }
        callback(true);
      });
    },
    Data.msgValidData('Afiliación')
  ]
};


var blood_type = {
  type: String,
  maxlength: 50,
  trim: true,
  validate: [
    function (blood_type, callback) {
      var BloodType = mongoose.model('BloodType');

      BloodType.findOne({ name: blood_type }, function (err, bloodType) {
        if (err || !bloodType) {
          callback(false);
        }
        callback(true);
      });
    },
    Data.msgValidData('Tipo de sangre')
  ]
};


var doctor = {
  type: Schema.ObjectId,
  ref: 'User',
  validate: [
    function (doctor, callback) {
      var User = mongoose.model('detalle_usuario');

      User.findOne({ _id: doctor }, function (err, user) {
        if (err || !user) {
          callback(false);
        }

        callback(true);
      });
    },
    Data.msgValidFormat('Doctor')
  ]
};


var tutor = {
  type: Schema.ObjectId,
  ref: 'User',
  validate: [
    function (tutor, callback) {
      var User = mongoose.model('detalle_usuario');

      User.findOne({ _id: tutor }, function (err, user) {


        if (err || !user) {

          callback(false);
        }


        callback(true);
      });
    },
    Data.msgValidFormat('Tutor')
  ]
};


// Defined patient's schema
var PatientSchema = new Schema({

  id_dispositivo: {
    type: Number
  },
  id_autonumerico: {
    type: Number
  },
  id_vacunado: {
    type: Number
  },
  id_direccion: Person.id_direccion,
  id_nacionalidad: Person.id_nacionalidad,
  id_estado_nacimiento: {
    type: Number
  },
  id_origen_registro: {
    type: Number
  },
  id_tipo_sangre: {
    type: Number
  },
  id_vacunacion: {
    type: String
  },
  nombre: Person.nombre,
  primer_apellido: Person.primer_apellido,
  segundo_apellido: Person.segundo_apellido,
  sexo: Person.sexo,
  curp: Person.curp,
  id_estatus: {
    type: Number
  },
  fecha_registro_app: Person.fecha_registro_app,
  fecha_registro: Person.fecha_registro,
  fecha_ultima_modificacion: Person.fecha_ultima_modificacion,
  fecha_nacimiento: Person.fecha_nacimiento,
  numero_instalacion_cev: {
    type:
      Number
  },
  id_tableta_cev: {
    type: Number
  },
  id_clues_cev: {
    type: Number
  },
  id_usuario_cev: { 
    type: Number 
  },
  rfc_cev: Person.rfc,
  correo_cev: {
    type: String
  },
  id_vacunado_cev: {
    type: String
  },
  fecha_validacion: {
    type: Date
  },
  estado_autorizacion: {
    type: Number
  }





  //   address: Data.address,
  //   affiliation: affiliation,
  //   affiliation_number: {
  //     type: String,
  //     trim: true,
  //     match: [/^[A-Z0-9]{15}$/, Data.msgValidFormat('Número de afiliación')]
  //   },
  //   birthdate: Person.fecha_nacimiento,
  //  // birthdate_as_iso_date: Person.iso_date,
  //  // birthplace: Person.birthplace,
  //   blood_type: blood_type,
  //   cev_id: Person.cev_id,
  //   client_creation_date: Person.fecha_creacion,
  //   client_delete_date:Person.client_delete_date,
  //  // client_creation_iso_date: Person.iso_date,
  //   country_id: Person.country_id,
  //   curp: Person.curp,
  //   status:Person.status,
  //   doctor: [
  //     doctor 
  //   ],
  //   father_surname: Person.father_surname,
  //   first_name: Person.first_name,
  //   gender: Person.gender,
  //   medical_record: {
  //     type: String,
  //     trim: true,
  //     match: [/^[0-9]{10}$/, Data.msgValidFormat('Registro médico')]
  //   },
  //   mother_surname: Person.mother_surname,
  //   phones: Person.phones,
  //   rfc: Person.rfc,
  //   tutor: [{
  //     kinship: Person.kinship,
  //     person: tutor
  //   }],
  //   fecha_creacion: Data.fecha_creacion,
  //   modified: Date
});


// Create fields as ISO Date
PatientSchema.pre('save', function (next) {
  var patient = this;

  if (patient.client_creation_date) {
    patient.client_creation_iso_date = patient.client_creation_date;
  }

  patient.birthdate_as_iso_date = patient.birthdate;

  next();
});


PatientSchema.pre('save', function (next) {
  var patient = this;

  if (patient.address.length > 0) {
    var Municipality = mongoose.model('Municipality');
    var Locality = mongoose.model('Locality');
    var j = 0;

    for (var i = 0; i < patient.address.length; i++) {
      var address = patient.address[i];
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

        for (var x = 0; x < patient.address.length; x++) {
          if (patient.address[x].locality_id == locality.id) {
            patient.address[x].locality_id = locality._id;
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

          for (var x = 0; x < patient.address.length; x++) {
            if (patient.address[x].municipality_id == municipality.id) {
              patient.address[x].municipality_id = municipality._id;
            }
          }

          j++;
          if (j === patient.address.length) {
            next();
          }
        });
      });
    }
  } else {
    next();
  }
});


PatientSchema.pre('findOneAndUpdate', function (next) {
  var patient = this._update;

  if (patient.address && patient.address.length > 0) {
    var Municipality = mongoose.model('Municipality');
    var Locality = mongoose.model('Locality');
    var j = 0;

    for (var i = 0; i < patient.address.length; i++) {
      var address = patient.address[i];
      var params = {
        state_id: address.state_id,
        municipality_id: address.municipality_id,
        id: address.locality_id
      };
      Locality.findOne(params, function (err, locality) {
        if (locality == null) {
          next();
        } else {
          if (err) {
            return res.status(400).send({
              success: false,
              message: tools.getErrorMessage(err)
            });
          }

          for (var x = 0; x < patient.address.length; x++) {
            if (patient.address[x].locality_id == locality.id) {
              patient.address[x].locality_id = locality._id;
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

            for (var x = 0; x < patient.address.length; x++) {
              if (patient.address[x].municipality_id == municipality.id) {
                patient.address[x].municipality_id = municipality._id;
              }
            }

            j++;
            if (j === patient.address.length) {
              next();
            }
          });

        }
      });
    }
  } else {
    next();
  }
});

// Link the patient with tutor(s)/doctor(s)
PatientSchema.post('save', function (patient) {
  var Doctor = mongoose.model('Medico');
  var Tutor = mongoose.model('responsables');
  var User = mongoose.model('detalle_usuario');

  // Add patient in doctor(s)
  for (var i = 0; i < patient.doctor.length; i++) {
    User.findOne({ _id: patient.doctor[i] }, function (err, user) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      }

      Doctor.findOne({ _id: user.user }, function (err, doctor) {

        if (doctor.patient.indexOf(patient._id) === -1) {
          doctor.patient.push(patient._id);
        }

        Doctor.findOneAndUpdate({ _id: user.user },
          { $set: { patient: doctor.patient } }, function (err) {
            if (err) {
              return res.status(400).send({
                success: false,
                message: tools.getErrorMessage(err)
              });
            }
          });
      });
    });
  }

  // Add patient in tutor(s)
  for (var j = 0; j < patient.tutor.length; j++) {
    var tutor = patient.tutor[j];
    User.findOne({ _id: tutor.person }, function (err, user) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      }

      Tutor.findOne({ _id: user.user }, function (err, doc) {

        var patients = doc.patient.map(function (object) { return object.person.toString(); });

        if (patients.indexOf(patient._id.toString()) === -1) {
          doc.patient.push({ kinship: tutor.kinship, person: patient._id });
        }

        Tutor.findOneAndUpdate({ _id: user.user },
          { $set: { patient: doc.patient } }, function (err) {
            if (err) {
              return res.status(400).send({
                success: false,
                message: tools.getErrorMessage(err)
              });
            }
          });
      });
    });
  }
});


// Create the 'Patient' model out of the 'PatientSchema'
mongoose.model('Patient', PatientSchema);
