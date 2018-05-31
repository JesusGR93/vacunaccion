// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define a new 'MunicipalitySchema'
var MunicipalitySchema = new Schema({
    _id: Number,
    state_id: {
    type: Number,
    trim: true,
    required: Data.msgRequired('Identificador de Estado')
  },
  id: {
    type: Number,
    trim: true,
    required: Data.msgRequired('Identificador')
  },
  name: {
    type: String,
    trim: true,
    required: Data.msgRequired('Nombre'),
    match: [/[A-Z ]{1,50}/, Data.msgValidFormat('Nombre')]
  },
  id_version:{
    type:Number
  }
});


// Create the 'Municipality' model out of the 'MunicipalitySchema'
mongoose.model('Municipality', MunicipalitySchema);
