// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'AboutSchema'
var AboutSchema = new Schema({
  _id: Number,
    titulo: {
    type: String,
    trim: true,
    match: [/[A-Z]{1,200}/, Data.msgValidFormat('titulo')]
  },
  descripcion: {
    type: String,
    trim: true,
    match: [/[A-Z]{1,200}/, Data.msgValidFormat('descripcion')]
  },
  id_version:{
    type:Number
  }
  
});


// Create the 'State' model out of the 'StateSchema'
mongoose.model('About', AboutSchema);
