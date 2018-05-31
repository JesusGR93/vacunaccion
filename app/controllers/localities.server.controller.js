// Invoke 'strict' JavaScript mode
'use strict';


// Load 'Locality' Mongoose model
var mongoose = require('mongoose');
var Model = mongoose.model('Locality');


// Create the middleware with the Locality's model
exports.readAll = function(req, res, next) {
  req.model = Model;
  req.populate = '';
  req.select = '-_id';
    
  next();
};


exports.find = function(req, res, next) {
  req.model = Model;
  req.populate = '';
  next();
};
