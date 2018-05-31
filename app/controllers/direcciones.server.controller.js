// Invoke 'strict' JavaScript mode
'use strict';

var mongoose = require('mongoose');
var Model = mongoose.model('direccione');






exports.findOne = function(req, res, next, id) {
    Model.findById(id)
    .populate('')
    .exec(function(err, object) {
      crud.oneObjectById(req, res, err, object, next);
    });
  };
  


exports.create = function (req, res, next) {
  //  req.object = new Model(req.body);

    req.object = new Model({
        id_estado: req.body.id_estado,
        id_municipio: req.body.id_municipio,
        id_localidad: req.body.id_localidad,
        id_tipo_vialidad: req.body.id_tipo_vialidad,
        nombre_vialidad: req.body.nombre_vialidad,
        id_tipo_asentamiento: req.body.id_tipo_asentamiento,
        nombre_asentamiento: req.body.nombre_asentamiento,
        cp: req.body.cp,
        n_exterior: req.body.n_exterior,
        n_interior: req.body.n_interior,
        entre_calle_1: req.body.entre_calle_1,
        entre_calle_2: req.body.entre_calle_2,
        referencia: req.body.referencia,
        id_tableta_cev: req.body.id_tableta_cev,
        numero_instalacion_cev: req.body.numero_instalacion_cev,
        id_usuario: req.body.id_usuario,
        id_dispositivo: req.body.id_dispositivo,
        fecha_validacion: req.body.fecha_validacion,
        fecha_validacion: req.body.fecha_validacion,
        id_ageb: req.body.id_ageb,
        id_manzana: req.body.id_manzana
    });
    next();
};




