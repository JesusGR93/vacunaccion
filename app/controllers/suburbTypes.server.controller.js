// Invoke 'strict' JavaScript mode
'use strict';


// Load 'SuburbType' Mongoose model
var mongoose = require('mongoose');
var Model = mongoose.model('SuburbType');


// Create the middleware with the SuburbType's model
exports.readAll = function(req, res, next) {
  req.model = Model;
  req.populate = '';
  req.select = '';
    
  next();
};
