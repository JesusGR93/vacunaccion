// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'AffiliationSchema'
var AffiliationSchema = new Schema({
  _id: Number,
  name: {
    type: String,
    trim: true,
    required: Data.msgRequired('Nombre de afiliación'),
    match: [/[A-Z \-]{1,50}/, Data.msgValidFormat('Nombre de afiliación')]
  },
  id_version:{type:Number}
});


// Create the 'Affiliation' model out of the 'AffiliationSchema'
mongoose.model('Affiliation', AffiliationSchema);
