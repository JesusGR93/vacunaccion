// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'CountrySchema'
var CountrySchema = new Schema({
  _id: Number,
  name: {
    type: String,
    trim: true,
    required: Data.msgRequired('Nombre'),
    match: [/[A-Z ]{1,50}/, Data.msgValidFormat('Nombre')]
  },
  code: {
    type: String,
    trim: true,
    required: Data.msgRequired('Código'),
    match: [/[A-Z \.]{3,7}/, Data.msgValidFormat('Código')]
  },
  id_version:{ type:Number}
});


// Create the 'Country' model out of the 'CountrySchema'
mongoose.model('Country', CountrySchema);
