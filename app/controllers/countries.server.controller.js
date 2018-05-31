// Invoke 'strict' JavaScript mode
'use strict';


// Load 'Country' Mongoose model
var mongoose = require('mongoose');
var Model = mongoose.model('Country');


// Create the middleware with the Country's model
exports.readAll = function(req, res, next) {
  req.model = Model;
  req.populate = '';
  req.select = '';
    
  next();
};
