// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Schema object
var Data = require('./data.server.model');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var VaccinesControlSchema = new Schema({
  patient:{
    type:         Schema.ObjectId,
    ref:          'Patient',
    required:     Data.msgRequired('Paciente'),
  },
  doctors:[
    {
      type:         Schema.ObjectId,
      ref:          'Doctor'
    }
  ],
  vaccine:{
    type:         Number,
    ref:          'Vaccine',
    required:     Data.msgRequired('Vacuna'),
    validate: [
      function(vaccine, callback) {
        var Vaccine = mongoose.model('Vaccine');

        Vaccine.findOne({_id: vaccine}, function(err, vaccine) {
          if (err || !vaccine) {
            callback(false);
          }

          callback(true);
        });
      },
      Data.msgValidData('Vacuna')
    ]
  },
  dosage:{
    type:         Number,
    ref:          'DosageVaccine',
    required:     Data.msgRequired('Dósis'),
  },
  clinic:{
    type:         Schema.ObjectId,
    ref:          'Clinic'
  },
  application_date: {
    type: String,
    required: Data.msgRequired('Fecha de aplicación'),
    match: [/^-?[0-9]+$/, Data.msgValidFormat('Fecha de aplicación')]
  },
  application_iso_date: {
    type: Date
  },
  observations:{
    type:         String,
    maxlength:    170,
    trim:         true
  },
  serial:{
    type:         String,
    maxlength:    20,
    trim:         true
  },
  expiration: {
    type: String,
    match: [/^-?[0-9]+$/, Data.msgValidFormat('Fecha de expiración')]
  },
  expiration_iso_date:{
    type: Date
  },
  color:{
    type:         Number,
    ref:          'ColorIndicator',
  },
  fecha_creacion:        Data.fecha_creacion,
  modified:       Date
});


// Create fields as ISO Date
VaccinesControlSchema.pre('save', function(next) {
  var vaccinesControl = this;

  if (vaccinesControl.expiration) {
    vaccinesControl.expiration_iso_date = vaccinesControl.expiration;
  }

  vaccinesControl.application_iso_date = vaccinesControl.application_date;

  next();
});


mongoose.model('VaccinesControl', VaccinesControlSchema);
