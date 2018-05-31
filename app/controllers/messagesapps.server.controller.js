//Invoke 'strict' JavaScript mode
'use strict';


// Load 'Origin' Mongoose model
var mongoose = require('mongoose');
var Model = mongoose.model('Messagesapp');


// Create the middleware with the Origin's model estados
exports.readAll = function(req, res, next) {
  req.model = Model;
  req.populate = '';
  req.select = '';
    
  next();
};
