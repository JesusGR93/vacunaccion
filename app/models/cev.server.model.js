// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Schema object
var Data = require('./data.server.model');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'CevSchema'
var CevSchema = new Schema({
  masked_id: {
    type: String,
    trim: true,
    required: Data.msgRequired('Identificador CEV'),
    match: [/^[2-9A-Z]+$/, Data.msgValidFormat('Identificador CEV')],
    index: {
      unique: true
    }
  },
  fecha_creacion: Data.fecha_creacion,
  modified: Date
});


// Create the 'Cev' model out of the 'CevSchema'
mongoose.model('Cev', CevSchema);
