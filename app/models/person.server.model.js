// Invoke 'strict', JavaScript mode
'use strict';


// Load dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Data = require('./data.server.model');


exports.fecha_nacimiento = {
  type: String,
  trim: true,
  required: Data.msgRequired('Fecha de nacimiento'),
  match: [/^-?[0-9]+$/, Data.msgValidFormat('Fecha de nacimiento')]
};


exports.id_nacionalidad = {
  type: String
};

exports.correo = {
  type: String
};

exports.fecha_registro = {
  type: Date
};

exports.fecha_ultima_modificacion ={
  type: Date
};

exports.id_direccion ={
  type: Number
}


exports.id_estado_nacimiento
  = {
    type: Number,
    ref: 'State',
    //required: Data.msgRequired('Entidad de nacimiento'),
    validate: [
      function (birthplace, callback) {
        var State = mongoose.model('State');

        State.findOne({ _id: birthplace }, function (err, birthplace) {
          if (err || !birthplace) {
            callback(false);
          }
          callback(true);
        })
      },
      Data.msgValidData('Entidad de nacimiento')
    ]
  };


exports.fecha_registro_app = {
  type: String,
  trim: true,
  match: [/^-?[0-9]+$/, Data.msgValidFormat('Fecha de creación')]
};

exports.client_delete_date = {
  type: String,
  trim: true,
  match: [/^-?[0-9]+$/, Data.msgValidFormat('Fecha de eliminación')]
};

exports.country_id = {
  type: Number,
  ref: 'Country',
  required: Data.msgRequired('Nacionalidad'),
  validate: [
    function (country_id, callback) {
      var Country = mongoose.model('Country');

      Country.findOne({ _id: country_id }, function (err, country) {
        if (err || !country) {
          callback(false);
        }
        callback(true);
      });
    },
    Data.msgValidData('Nacionalidad')
  ]
};


exports.curp = {
  type: String,
  trim: true,
  // match: [/^[A-Z]{4}[0-9]{6}[A-Z]{6}([0-9]{2})?$/, Data.msgValidFormat('CURP')]
};


exports.primer_apellido = {
  type: String,
  trim: true,
  maxlength: 50,
  required: Data.msgRequired('Apellido paterno')
};


exports.nombre = {
  type: String,
  trim: true,
  maxlength: 50,
  required: Data.msgRequired('Nombre')
};


exports.sexo = {
  type: String,
  trim: true,
  enum: ['H', 'M']
};

exports.status = {
  type: Number,
  enum: [0, 1]
};

exports.iso_date = {
  type: Date
};


exports.kinship = {
  type: String,
  maxlength: 50,
  trim: true,
  validate: [
    function (kinship, callback) {
      var Kinship = mongoose.model('Kinship');

      Kinship.findOne({ type: kinship }, function (err, kinship) {
        if (err || !kinship) {
          callback(false);
        }
        callback(true);
      });
    },
    Data.msgValidData('Parentesco')
  ]
};


exports.cev_id = {
  type: Schema.ObjectId,
  ref: 'Cev',
  validate: [
    function (cev_id, callback) {
      var Cev = mongoose.model('Cev');

      Cev.findOne({ _id: cev_id }, function (err, cev) {
        if (err || !cev) {
          callback(false);
        }

        callback(true);
      });
    },
    Data.msgValidData('Identificador CEV')
  ]
};


exports.segundo_apellido = {
  type: String,
  trim: true,
  maxlength: 50,
  required: Data.msgRequired('Apellido materno')
};


exports.phones = [{
  type: {
    type: String,
    trim: true,
    required: true,
    enum: ['MOBILE', 'HOME']
  },
  telephone_number: {
    type: String,
    trim: true,
    match: [/^[0-9]{8,10}$/, Data.msgValidFormat('teléfono')]
  },
  provider: {
    type: String,
    trim: true,
    validate: [
      function (provider, callback) {
        var params = {
          type: this.type,
          name: provider
        };
        var TelephonyServiceProvider = mongoose
          .model('TelephonyServiceProvider');

        TelephonyServiceProvider.findOne(params,
          function (err, telephonyServiceProvider) {
            if (err || !telephonyServiceProvider) {
              callback(false);
            }
            callback(true);
          });
      },
      Data.msgValidData('Proovedor de telefonía')
    ]
  }
}];


exports.rfc = {
  type: String,
  trim: true,
  match: [/^[A-Z]{4}[0-9]{6}([A-Z0-9]{2,3})?$/, Data.msgValidFormat('RFC')]
};
