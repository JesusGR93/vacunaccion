// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'BloodTypeSchema'
var BloodTypeSchema = new Schema({
  _id: Number,
  name: {
    type: String,
    trim: true,
    required: Data.msgRequired('Tipo de sangre'),
    match: [/[A-Z ]{1,50}/, Data.msgValidFormat('Tipo de sangre')]
  },
  id_vesion:{
    type:Number
  }
});


// Create the 'BloodType' model out of the 'BloodTypeSchema'
mongoose.model('BloodType', BloodTypeSchema);
