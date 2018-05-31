// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Schema object
var Data = require('./data.server.model');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'DeletedClinicSchema'
var DeletedClinicSchema = new Schema({
  id: {
    type: String,
    maxlength: 50,
    trim: true,
    index: true
  },
  name: {
    type: String,
    maxlength: 50,
    trim: true,
  },
  address: [{
    state_id : Number,
    municipality_id: Number,
    locality_id: Number,
    zip_code: Data.zipCode
  }],
  fecha_creacion: Data.fecha_creacion,
  modified: Date
});


// Create the 'DeletedClinic' model out of the 'DeletedClinicSchema'
mongoose.model('DeletedClinic', DeletedClinicSchema);
