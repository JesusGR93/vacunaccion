var Schema = "Affiliation";

var mongoose = require('mongoose');
var Model = mongoose.model(Schema);

var crud = require('./crud.server.controller');
var tools = require('./tools.server.controller');

// Create the middleware with the BloodType's model
exports.readAll = function(req, res, next) {
  req.model = Model;
  req.populate = '';
  req.select = '';
    
  next();
};
