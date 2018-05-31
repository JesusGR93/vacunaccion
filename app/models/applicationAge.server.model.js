// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Schema object
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ApplicationAgeSchema = new Schema({
  _id:            Number,
  min:{
    type:         Number,
  },
  optimal:{
    type:         Number,
    required:     Data.msgRequired('Edad óptima'),
  },
  description:{
    type:         String,
    maxlength:    100,
    trim:         true,
  },
  id_version:{type:Number}
});


mongoose.model('ApplicationAge', ApplicationAgeSchema);
