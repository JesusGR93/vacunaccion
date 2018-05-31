// Invoke 'strict', JavaScript mode
'use strict';


var mongoose = require('mongoose');


var string = {
  type: String,
  trim: true,
  maxlength: 50
};


// Custom messages
exports.msgRequired = function(value) {
  return 'El campo \'' + value + '\' es obligatorio';
};

exports.msgValidFormat = function(value) {
  return 'Formato de \'' + value + '\' no válido';
};

exports.msgValidData = function(value) {
  return 'El valor del campo \'' + value + '\' no es válido';
}


exports.reference = {
  type: String,
  trim: true,
  maxlength: 250
};


exports.number = {
  type: String,
  trim: true,
  match: [/^[0-9A-Z]{1,10}$/, this.msgValidFormat('Número')]
};


// General zip code's schema
exports.zipCode = {
  type: String,
  trim: true,
  match: [/[0-9]{5}/, this.msgValidFormat('Código Postal')]
};


// General state_id' schema
exports.state_id = {
  type: Number,
  ref: 'State',
  required: this.msgRequired('Estado'),
  validate: [
    function(state_id, callback) {

      var State = mongoose.model('State');

      State.findOne({_id: state_id}, function(err, state) {
        
        if (err || !state) {
          callback(false);
        }
        callback(true);
      })
    },
    this.msgValidData('Estado')
  ]
};


// General municipality_id' schema
exports.municipality_id = {
  type: Number,
  ref: 'Municipality',
  required: this.msgRequired('Municipio'),
  validate: [
    function(municipality_id, callback) {
   
      var Municipality = mongoose.model('Municipality');

      var params = {
        id: municipality_id,
        state_id: this.state_id
      };

      Municipality.findOne(params, function(err, municipality) {
        if (err || !municipality) {
          callback(false);
        }
        callback(true);
      })
    },
    this.msgValidData('Municipio')
  ]
};


// General locality_id' schema
exports.locality_id = {
  type: Number,
  ref: 'Locality',
  required: this.msgRequired('Localidad'),
  validate: [
    function(locality_id, callback) {
      var Locality = mongoose.model('Locality');

      var params = {
        id: locality_id,
        municipality_id: this.municipality_id,
        state_id: this.state_id
      };

      Locality.findOne(params, function(err, locality) {
        if (err || !locality) {
          callback(false);
        }
        callback(true);
      })
    },
    this.msgValidData('Localidad')
  ]
};


exports.address = [{
  state_id: this.state_id,
  municipality_id: this.municipality_id,
  locality_id: this.locality_id,
  zip_code: this.zipCode,
  suburb_type: {
    type: String,
    maxlength: 50,
    trim: true,
    validate: [
      function(suburb_type, callback) {
        var SuburbType = mongoose.model('SuburbType');
        
        SuburbType.findOne({name: suburb_type}, function(err, suburb_type) {
  
          if (err || !suburb_type) {
            callback(false);
          }
          callback(true);
        });
      },
      this.msgValidData('Tipo de suburbio')
    ]
  },
  suburb_name: string,
  street_type: {
    type: String,
    maxlength: 50,
    trim: true,
    validate: [
      function(street_type, callback) {
        var StreetType = mongoose.model('StreetType');

        StreetType.findOne({name: street_type}, function(err, object) {
          if (err || !object) {
            callback(false);
          }
          callback(true);
        });
      },
      this.msgValidData('Tipo de calle')
    ]
  },
  street_name: string,
  ext_number: this.number,
  int_number: this.number,
  between_street_1: string,
  between_street_2: string,
  reference: this.reference
}];



// General creation status' schema
exports.fecha_creacion = {
  type: Date,
  default: Date.now
};
exports.delete = {
  type: Date,
  default: Date.now
};
