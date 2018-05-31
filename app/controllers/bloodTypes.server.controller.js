// Invoke 'strict' JavaScript mode
'use strict';


// Load 'BloodType' Mongoose model
var mongoose = require('mongoose');
var Model = mongoose.model('BloodType');


// Create the middleware with the BloodType's model
exports.readAll = function(req, res, next) {
  req.model = Model;
  req.populate = '';
  req.select = '';
    
  next();
};
