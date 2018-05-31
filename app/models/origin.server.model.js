// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'originSchema'
var OriginSchema = new Schema({
  _id:{type:Number},
  name: {
    type: String,
    trim: true,
    required: Data.msgRequired('Nombre'),
    match: [/[A-Z]{1,50}/, Data.msgValidFormat('Nombre')]
  },
  id_version:{
    type:Number
  }

  
});


// Create the 'State' model out of the 'StateSchema'
mongoose.model('Origin', OriginSchema);
