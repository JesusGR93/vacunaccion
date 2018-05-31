// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'LogcatalogSchema'
var LogcatalogSchema = new Schema({
  _id_catalogo: Number,
    descripcion: {
    type: String,
    trim: true,
    match: [/[A-Z]{1,200}/, Data.msgValidFormat('descripcion')]
  },
  create:Data.fecha_creacion

  
});


// Create the 'State' model out of the 'StateSchema'
mongoose.model('Logcatalog', LogcatalogSchema);
