// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Data model
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define a new 'Messagesappchema'
var MessagesapSchema = new Schema({
  _id: Number,
  codigo:{type:Number},
  Titulo: {
    type: String,
    trim: true,
    match: [/[A-Z]{1,50}/, Data.msgValidFormat('Titulo')]
  },
  id_version:{
    type:Number
  }

  
});


// Create the 'State' model out of the 'StateSchema'
mongoose.model('Messagesapp', MessagesapSchema);
