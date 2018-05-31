/* jslint node: true */


// Invoke 'strict' JavaScript mode
'use strict';


// Load the module dependencies
var config = require('./config');
var mongoose = require('mongoose');

var modelPath = ['../app/models/', '.server.model'];


// Define the Mongoose configuration method
module.exports = function() {
  // Use Mongoose to connect to MongoDB
  var db = mongoose.connect(config.db, function(err) {
    if (err) {
      console.log(err);
    }
  });

  // Load the application models
  require(modelPath[0] + 'admin' + modelPath[1]);

  require(modelPath[0] + 'affiliation' + modelPath[1]);
  require(modelPath[0] + 'bloodType' + modelPath[1]);
  require(modelPath[0] + 'cev' + modelPath[1]);
  require(modelPath[0] + 'country' + modelPath[1]);

  require(modelPath[0] + 'clinic' + modelPath[1]);
  require(modelPath[0] + 'deleted.clinic' + modelPath[1]);

  require(modelPath[0] + 'doctor' + modelPath[1]);

  require(modelPath[0] + 'kinship' + modelPath[1]);
  require(modelPath[0] + 'locality' + modelPath[1]);
  require(modelPath[0] + 'municipality' + modelPath[1]);

  require(modelPath[0] + 'patient' + modelPath[1]);
  require(modelPath[0] + 'deleted.patient' + modelPath[1]);

  require(modelPath[0] + 'state' + modelPath[1]);
  require(modelPath[0] + 'streetType' + modelPath[1]);
  require(modelPath[0] + 'suburbType' + modelPath[1]);
  require(modelPath[0] + 'telephonyServiceProvider' + modelPath[1]);

  require(modelPath[0] + 'tutor' + modelPath[1]);
  require(modelPath[0] + 'user' + modelPath[1]);
  require(modelPath[0] + 'deleted.user' + modelPath[1]);

  require(modelPath[0] + 'colorIndicator' + modelPath[1]);

  require(modelPath[0] + 'applicationAge' + modelPath[1]);

  require(modelPath[0] + 'administrationRoute' + modelPath[1]);

  require(modelPath[0] + 'vaccine' + modelPath[1]);

  require(modelPath[0] + 'dosageVaccine' + modelPath[1]);
  
  require(modelPath[0] + 'vaccinesControl' + modelPath[1]);
  require(modelPath[0] + 'deleted.vaccinesControl' + modelPath[1]);
  require(modelPath[0] + 'origin' + modelPath[1]);
  require(modelPath[0] + 'catalogs' + modelPath[1]);
  require(modelPath[0] + 'about' + modelPath[1]);
  require(modelPath[0] + 'messagesapp' + modelPath[1]);
  require(modelPath[0] + 'logcatalogs' + modelPath[1]);
  require(modelPath[0] + 'catalogversion' + modelPath[1]);
  require(modelPath[0] + 'binnacleuser' + modelPath[1]);
  require(modelPath[0] + 'direcciones' + modelPath[1]);
  require(modelPath[0] + 'relresponsablecontacto' + modelPath[1]);
  require(modelPath[0] + 'telefonos' + modelPath[1]);
  // Return the Mongoose connection instance
  return db;
};
