// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'KinshipSchema'
var KinshipSchema = new Schema({
  _id: Number,
  type: {
    type: String,
    trim: true,
    required: Data.msgRequired('Tipo'),
    match: [/[A-Z]{1,20}/, Data.msgValidFormat('Tipo')]
  },
  id_version:{
    type:Number
  }
});


// Create the 'Kinship' model out of the 'KinshipSchema'
mongoose.model('Kinship', KinshipSchema);
