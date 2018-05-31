// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Schema object
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VaccineSchema = new Schema({
  _id:            Number,
  name:{
    type:         String,
    required:     Data.msgRequired('Nombre de vacuna'),
    maxlength:    100,
    trim:         true,
    unique:       true
  },
  
  administration_route:{
    type:         Number,
    ref:          "AdministrationRoute",
    required:     Data.msgRequired('Vía de administración')
  },
  dose:{
    type:         String,
    required:     Data.msgRequired('Dósis')
  },
  
  id_version:{type:Number}
});


mongoose.model('Vaccine', VaccineSchema);
