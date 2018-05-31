// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'LocalitySchema'
var LocalitySchema = new Schema({
  _id: Number,
  id: {
    type: Number,
    trim: true,
    required: Data.msgRequired('Identificador')
  },
  state_id: {
    type: Number,
    trim: true,
    required: Data.msgRequired('Identificador de Estado')
  },
  municipality_id: {
    type: Number,
    trim: true,
    required: Data.msgRequired('Identificador de Municipio')
  },
  name: {
    type: String,
    trim: true,
    required: Data.msgRequired('Nombre'),
    match: [/[A-Z ]{1,40}/, Data.msgValidFormat('Nombre')]
  }
});


// Create the 'Locality' model out of the 'LocalitySchema'
mongoose.model('Locality', LocalitySchema);