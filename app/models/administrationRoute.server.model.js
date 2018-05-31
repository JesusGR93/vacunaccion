// Invoke 'strict' JavaScript mode
'use strict';


var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var AdministrationRouteSchema = new Schema({
  _id:            Number,
  name:{
    type:         String,
    required:     Data.msgRequired('Nombre de ruta de administración'),
    maxlength:    30,
    trim:         true
  },
  description:{
    type:         String,
    trim:         true,
    maxlength:    30,
  },
 id_version:{type:Number}
});


mongoose.model('AdministrationRoute', AdministrationRouteSchema);
