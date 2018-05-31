// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Schema object
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var DosageVaccineSchema = new Schema({
  _id:            Number,
  vaccine:{
    type:         Number,
    ref:          "Vaccine",
    required:     Data.msgRequired('Vacuna'),
  },
  application_age:{
    type:         Number,
    ref:          "ApplicationAge",
    required:     Data.msgRequired('Edad de aplicación'),
  },
  description:{
    type:         String,
    maxlength:    200,
    trim:         true,
    required:     Data.msgRequired('Descripción de la dósis')
  },
  column:{ //num_dossage
    type:         Number
  },
  id_version:{type:Number}
});


mongoose.model('DosageVaccine', DosageVaccineSchema);
