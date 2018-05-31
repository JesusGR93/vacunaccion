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
    function(affiliation, callback) {
      var Affiliation = mongoose.model('Affiliation');

      Affiliation.findOne({name: affiliation}, function(err, object) {
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
    function(blood_type, callback) {
      var BloodType = mongoose.model('BloodType');

      BloodType.findOne({name: blood_type}, function(err, bloodType) {
        if (err || !bloodType) {
          callback(false);
        }
        callback(true);
      });
    },
    Data.msgValidData('Tipo de sangre')
  ]
};


var tutor = {
  type: Schema.ObjectId,
  ref: 'Tutor'
};


// Defined patient's schema
var DeletedPatientSchema = new Schema({
//   address: [{
//     state_id: Number,
//     municipality_id: Number,
//     locality_id: Number,
//     zip_code: Data.zipCode,
//     suburb_type: String,
//     suburb_name: String,
//     street_type: String,
//     street_name: String,
//     ext_number: String,
//     int_number: String,
//     between_street_1: String,
//     between_street_2: String,
//     reference: String,
//   }],
//   affiliation: affiliation,
//   affiliation_number: {
//     type: String,
//     trim: true,
//     match: [/^[A-Z0-9]{15}$/, Data.msgValidFormat('Número de afiliación')]
//   },
//   birthdate: Person.fecha_nacimiento,
//  // birthdate_as_iso_date: Person.iso_date,
//   birthplace: Person.id_nacionalidad,
//   blood_type: blood_type,
//   cev_id: Person.cev_id,
//   client_creation_date: Person.fecha_registro_app,
//   client_creation_iso_date: Person.iso_date,
//   country_id: Person.country_id,
//   curp: Person.curp,
//   father_surname: Person.father_surname,
//   first_name: Person.first_name,
//   gender: Person.gender,
//   medical_record: {
//     type: String,
//     trim: true,
//     match: [/^[0-9]{10}$/, Data.msgValidFormat('Registro médico')]
//   },
//   mother_surname: Person.mother_surname,
//   phones: Person.phones1,
//   rfc: Person.rfc,
//   tutor: [{
//     kinship: Person.kinship,
//     person: tutor
//   }],
//   fecha_creacion: Data.fecha_creacion,
//   modified: Date
});


// Create the 'DeletedPatient' model out of the 'DeletedPatientSchema'
mongoose.model('DeletedPatient', DeletedPatientSchema);
