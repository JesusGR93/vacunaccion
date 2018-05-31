// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'StateSchema'
var StateSchema = new Schema({
  _id: Number,
  name: {
    type: String,
    trim: true,
    required: Data.msgRequired('Nombre'),
    match: [/[A-Z]{1,50}/, Data.msgValidFormat('Nombre')]
  },
  code: {
    type: String,
    trim: true,
    required: Data.msgRequired('Código'),
    match: [/[A-Z]{2}/, Data.msgValidFormat('Código')]
  },
  id_version:{
    type:Number
  }

  
});


// Create the 'State' model out of the 'StateSchema'
mongoose.model('State', StateSchema);
