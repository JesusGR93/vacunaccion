var Schema = "Kinship";

var mongoose = require('mongoose');
var Model = mongoose.model(Schema);

var crud = require('./crud.server.controller');
var tools = require('./tools.server.controller');


exports.readAll = function(req, res, next) {
  req.model = Model;
  req.populate = '';
  req.select = '-_id';
    
  next();
};


