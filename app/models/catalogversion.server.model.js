// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'CatalogversionSchema'
var CatalogversionSchema = new Schema({
  _id_catalogo_version: Number,
  _id_catalogo: Number,
  version_bd:Number,
  fecha_registro_bd:Data.fecha_creacion,
  fecha_fuente:Data.fecha_creacion,
  version_fuente:{
    type: String,
    trim: true,
    required: Data.msgRequired('Version de fuente')
  }
  

});


// Create the 'Locality' model out of the 'CatalogversionSchema'
mongoose.model('Catalogversion', CatalogversionSchema);
