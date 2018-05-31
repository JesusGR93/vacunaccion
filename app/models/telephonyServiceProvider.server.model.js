// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'TelephonyServiceProviderSchema'
var TelephonyServiceProviderSchema = new Schema({
  _id: Number,
  name: {
    type: String,
    trim: true,
    required: Data.msgRequired('Nombre'),
    match: [/[A-Z]{3}/, Data.msgValidFormat('Nombre')]
  },
  type: {
    type: String,
    trim: true,
    required: Data.msgRequired('Tipo'),
    enum: ['MOBILE', 'HOME']
  }
});


// Create the 'TelephonyServiceProvider' model out of the 
// 'TelephonyServiceProviderSchema'
mongoose.model('TelephonyServiceProvider', TelephonyServiceProviderSchema);
