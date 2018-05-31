// Invoke 'strict' JavaScript mode
'use strict';


// Load dependencies
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Person = require('./person.server.model.js');

var patient = {
  type: Schema.ObjectId,
  ref: 'Patient',
  validate: [
    function(patient, callback) {
      var Patient = mongoose.model('Patient');

      Patient.findOne({_id: patient}, function(err, user) {
        if (err || !user) {
          callback(false);
        }

        callback(true);
      });
    },
    Data.msgValidFormat('Menor')
  ]
};


var DoctorSchema = new Schema({

  nombre: Person.nombre,
  primer_apellido: Person.primer_apellido,
  segundo_apellido: Person.segundo_apellido,
  id_nacionalidad: Person.id_nacionalidad,
  id_estado_nacimiento: Person.id_estado_nacimiento,
  sexo: Person.sexo,
  fecha_nacimiento: Person.fecha_nacimiento,
  curp: Person.curp,
  numero_celular: {
    type: Number
  },

  id_direccion: Person.id_direccion,
  cedula_profesional: {
    type: String
  },
  correo:Person.correo,
  fecha_registro_app: Person.fecha_registro_app,
  fecha_registro: Person.fecha_registro,
  fecha_ultima_modificacion: Person.fecha_ultima_modificacion,
  id_estatus:{
    type:Number
  },
  id_vacunado:{
    type: Number
  },
  id_clinica:{
    type: Number
  }
});

var MedicoSchema = new Schema({
  nombre: {
    type: String
  },
  primer_apellido: {
    type: String
  },
  segundo_apellido: {
    type: String
  },
  id_nacionalidad: {
    type: Number
  },
  id_estado_nacimiento: {
    type: Number
  },
  sexo: {
    type: String
  },
  fecha_nacimiento: {
    type: Date
  },
  curp: {
    type: String
  },
  numero_celular: {
    type: Number
  },
  id_direccion:{
    type: Number
  },
  cedula_profesional:{
    type: String
  },
  fecha_registro_app:{
    type: Date
  },
  fecha_registro:{
    type: Date
  },
  fecha_ultima_edicion:{
    type: Date
  },
  id_status:{
    type: Number
  },
  id_vacunado:{
    type: String
  },
  id_clinica:{
    type: String
  }
});

// Defined doctor's schema
// var DoctorSchema = new Schema({
//   address: Data.address,
//   birthdate: Person.birthdate,
//   birthdate_as_iso_date: Person.iso_date,
//   birthplace: Person.birthplace,
//   client_creation_date: Person.client_creation_date,
//   client_creation_iso_date: Person.iso_date,
//   clinic: [{
//     type: Schema.ObjectId,
//     ref: 'Clinic',
//     validate: [
//       function(clinic, callback) {
//         var Clinic = mongoose.model('Clinic');

//         Clinic.findOne({_id: clinic}, function(err, clinic) {
//           if (err || !clinic) {
//             callback(false);
//           }

//           callback(true);
//         });
//       },
//       Data.msgValidFormat('Centro de Salud')
//     ]
//   }],
//   country_id: Person.country_id,
//   curp: Person.curp,
//   father_surname: Person.father_surname,
//   first_name: Person.first_name,
//   gender: Person.gender,
//   mother_surname: Person.mother_surname,
//   patient: [
//     patient
//   ],
//   phones: Person.phones,
//   professional_license: {
//     type: String,
//     trim: true,
//     required: Data.msgRequired('Cédula profesional'),
//     match: [/^[0-9]{7}$/, Data.msgValidFormat('Cédula profesional')]
//   },
//   rfc: Person.rfc,
//   fecha_creacion: Data.fecha_creacion,
//   client_delete_date:Person.client_delete_date,
//   status:Person.status,
//   modified: Date
// });


// Create fields as ISO Date
DoctorSchema.pre('save', function(next) {
  var UserModel = mongoose.model('detalle_usuario');
  var PatientModel = mongoose.model('Patient');
  var newDoctor = this;

  var DoctorPopulate = [{
    path: 'user',
    select: 'patient',
    model: 'Doctor'
  }];

    UserModel.findOne({'user': newDoctor._id})
    .populate(DoctorPopulate)
    .exec(function(err, oldDoctor) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      } else {

        if (oldDoctor && oldDoctor.user && newDoctor.patient && 
          oldDoctor.user.patient.length > newDoctor.patient.length) {

          newDoctor.patient = newDoctor.patient.map(function(key, val, array) {
            return key.toString();
          });

          for (var i=0; i<oldDoctor.user.patient.length; i++) {
            if (newDoctor.patient.indexOf(oldDoctor.user.patient[i].toString()) < 0) {
              PatientModel.findById({ _id: oldDoctor.user.patient[i] },
                function(error, doc) {
                  if (err) {
                    return res.status(400).send({
                      success: false,
                      message: tools.getErrorMessage(err)
                    });
                  } else {
                    doc.doctor.pull(oldDoctor._id);
                    doc.update(doc).exec();   
                  } 
                }); 
            }
          }

        }

        if (newDoctor.client_creation_date) {
          newDoctor.client_creation_iso_date = newDoctor.client_creation_date;
        }

        newDoctor.birthdate_as_iso_date = newDoctor.birthdate;
        next();
      }
    
    });

});


DoctorSchema.pre('save', function(next) { 
  var user = this;
  var Municipality = mongoose.model('Municipality');
  var Locality = mongoose.model('Locality');
  var j = 0;

  for (var i = 0; i < user.address.length; i++) {
    var address = user.address[i];
    var params = {
      state_id: address.state_id,
      municipality_id: address.municipality_id,
      id: address.locality_id
    };

    Locality.findOne(params, function(err, locality) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      }

      for (var x = 0; x < user.address.length; x++) {
        if (user.address[x].locality_id == locality.id) {
          user.address[x].locality_id = locality._id;
        }
      }

      var params = {
        state_id: locality.state_id,
        id: locality.municipality_id
      };

      Municipality.findOne(params, function(err, municipality) {
        if (err) {
          return res.status(400).send({
            success: false,
            message: tools.getErrorMessage(err)
          });
        }

        for (var x = 0; x < user.address.length; x++) {
          if (user.address[x].municipality_id == municipality.id) {
            user.address[x].municipality_id = municipality._id;
          }
        }

        j++;
        if (j === user.address.length) {
          next();
        }
      });
    });
  }
});


// Link the doctor with patient
DoctorSchema.post('save', function(doctor) {
  var Patient = mongoose.model('Patient');
  var User = mongoose.model('detalle_usuario');


  // Add patient in doctor(s
  User.findOne({user: doctor._id}, function(err, tutorUser) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }

    for (var i = 0; i < doctor.patient.length; i++) {

      Patient.findOne({_id: doctor.patient[i]}, function(err, patient) {
        if (err) {
          return res.status(400).send({
            success: false,
            message: tools.getErrorMessage(err)
          });
        }

        if (patient.doctor.indexOf(tutorUser._id) === -1) {
          patient.doctor.push(tutorUser._id);
        } 

        Patient.findOneAndUpdate({_id: patient._id}, 
            {$set:{doctor: patient.doctor}}, function(err) {
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

// Create the 'Doctor' model out of the 'DoctorSchema'
mongoose.model('Medico', DoctorSchema);
