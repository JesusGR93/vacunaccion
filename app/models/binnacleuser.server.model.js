// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Schema object
var Data = require('./data.server.model');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DoctorModel = mongoose.model('Medico');
var TutorModel = mongoose.model('responsables');
var AdminModel = mongoose.model('Admin');

// Define a new 'binnacleuserSchema'

var BinnacleuserSchema = new Schema({
  origin:Number,
  origin_modificacion:Number,
validado:{type:Number},
fecha_actualizacion:Data.fecha_creacion,
user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  description:{type:String},
  correo: {
    type: String,
    maxlength: 50,
    trim: true
  }

});

mongoose.model('Binnacleuser', BinnacleuserSchema);