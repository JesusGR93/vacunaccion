// Invoke 'strict' JavaScript mode
'use strict';


// Load 'State' Mongoose model
var mongoose = require('mongoose');
var Model = mongoose.model('Catalogversion');
var modeloCatalogs = mongoose.model('Catalog');

// Create the middleware with the State's model estados
exports.readAll = function (req, res, next) {
  req.model = Model;
  req.populate = '';
  req.select = '';

  next();
};


exports.versionCatalogo = function (req, res, next) {
  var catalogs = [];
  Model.find({status:1}).exec(function (err, object) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    } else {
      for (var i = 0; i < object.length; i++) {
        if (object[i]._id_catalogo == req.body[i].id_catalogo && object[i]._id_catalogo_version > req.body[i].version) {
          catalogs.push(req.body[i].id_catalogo);
          console.log(catalogs);
        } else {
          console.log('Datos identicos'+ [i]);
        }
      }
    }
    if (catalogs.length > 0) {
      //searchCatalogo();
    } else {
      return res.status(200).send({
        success: true,
        message: 'sin actualizaciones '
      });
    }
  });




};

