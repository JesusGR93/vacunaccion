// Invoke 'strict' JavaScript mode
'use strict';


// Load 'State' Mongoose model
var mongoose = require('mongoose');
var Model = mongoose.model('Logcatalog');


// Create the middleware with the State's model estados
exports.readAll = function(req, res, next) {
  req.model = Model;
  req.populate = '';
  req.select = '';
    
  next();
};
