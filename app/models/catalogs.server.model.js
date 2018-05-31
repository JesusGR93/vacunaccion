// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'CatalogSchema'
var CatalogSchema = new Schema({
  _id: Number,
  name: {
    type: String,
    trim: true,
    required: Data.msgRequired('Nombre'),
    match: [/[A-Z ]{1,40}/, Data.msgValidFormat('Nombre')]
  },
  id_version:{
    type:Number
  },
  create:Data.fecha_creacion

});


// Create the 'Locality' model out of the 'LocalitySchema'
mongoose.model('Catalog', CatalogSchema);
