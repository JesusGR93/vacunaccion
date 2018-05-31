// Invoke 'strict' JavaScript mode
'use strict';


// Load dependencies
var Data = require('./data.server.model');
var Person = require('./person.server.model');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Defined admin's schema
var AdminSchema = new Schema({
  nombre: Person.first_name,
  primer_apellido: Person.father_surname,
  segundo_apellido: Person.mother_surname,
  fecha_registro: Data.fecha_creacion,    
  fecha_modificacion: Date
});


// Create the 'Admin' model out of the 'AdminSchema'
mongoose.model('Admin', AdminSchema);
