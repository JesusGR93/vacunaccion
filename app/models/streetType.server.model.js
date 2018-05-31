// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'StreetTypeSchema'
var StreetTypeSchema = new Schema({
  _id: Number,
  name: {
    type: String,
    trim: true,
    required: Data.msgRequired('Nombre'),
    match: [/[A-Z ]{1,20}/, Data.msgValidFormat('Nombre')]
  }
});


// Create the 'StreetType' model out of the 'StreetTypeSchema'
mongoose.model('StreetType', StreetTypeSchema);
