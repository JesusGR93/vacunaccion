// Invoke 'strict' JavaScript mode
'use strict';


// Load 'StreetType' Mongoose model
var mongoose = require('mongoose');
var Model = mongoose.model('StreetType');


// Create the middleware with the StreetType's model
exports.readAll = function(req, res, next) {
  req.model = Model;
  req.populate = '';
  req.select = '';
    
  next();
};
