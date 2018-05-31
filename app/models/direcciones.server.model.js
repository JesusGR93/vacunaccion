// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Schema object
var mongoose = require('mongoose');
var Data = require('./data.server.model.js');
var Schema = mongoose.Schema;



var direccionSchema = new Schema({
    id_estado: {
        type: Number
    },
    id_municipio: {
        type: Number
    },
    id_localidad: {
        type: Number
    },
    id_tipo_vialidad: {
        type: Number
    },
    nombre_vialidad: {
        type: String
    },
    id_tipo_asentamiento: {
        type: Number
    },
    nombre_asentamiento: {
        type: String
    },
    cp: {
        type: String
    },
    n_exterior: {
        type: String
    },
    n_interior: {
        type: String
    },
    entre_calle_1: {
        type: String
    },
    entre_calle_2: {
        type: String
    },
    referencia: {
        type: String
    },
    id_tabla_cev: {
        type: Number
    },
    numero_instalacion_cev: {
        type: Number
    },
    id_usuario: {
        type: String
    },
    id_dispositivo: {
        type: String
    },
    fecha_validacion: {
        type: Date
    },
    estado_autorizacion: {
        type: Number
    },
    id_ageb: {
        type: Number
    },
    id_manzana: {
        type: Number
    }

});

mongoose.model('direccione',direccionSchema);