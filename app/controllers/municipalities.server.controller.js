// Invoke 'strict' JavaScript mode
'use strict';


// Load 'Municipality' Mongoose model
var mongoose = require('mongoose');
var Model = mongoose.model('Municipality');


// Create the middleware with the Municipality's model
exports.readAll = function(req, res, next) {
  req.model = Model;
  req.populate = '';
  req.select = '';
    
  next();
};

exports.find = function(req, res, next) {


  req.model = Model;
  req.populate = '';
  next();
};