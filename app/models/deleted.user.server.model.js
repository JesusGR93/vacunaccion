// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Schema object
var base64 = require('base-64');
var bcrypt = require('bcrypt-nodejs');
var config = require('../../config/config');
var Data = require('./data.server.model');
var forge = require('node-forge');
var mongoose = require('mongoose');
var Person = require('./person.server.model');
var Schema = mongoose.Schema;


// Define a new 'DeletedUserSchema'
var DeletedUserSchema = new Schema({
  correo: {
    type: String,
    required: Data.msgRequired('Correo electrónico'),
    maxlength: 50,
    trim: true,
    match: [/.+\@.+\..+/, Data.msgValidFormat('Correo electrónico')],
    index: true
  },
  rol: {
    type: String,
    trim: true,
    require: Data.msgRequired('Rol'),
    enum: ['admin', 'doctor', 'tutor']
  },
  red_social: {
    type: String,
    trim: true,
    enum: ['google+', 'twitter', 'facebook']
  },
  url_token: {
    type: String,
    trim: true,
    match: [/^[A-Za-z0-9]{17}$/, Data.msgValidFormat('URL token')]
  },
  user: {
    address: [{
      state_id: Number,
      municipality_id: Number,
      locality_id: Number,
      zip_code: Data.zipCode,
      suburb_type: String,
      suburb_name: String,
      street_type: String,
      street_name: String,
      ext_number: Data.number,
      int_number: Data.number,
      between_street_1: String,
      between_street_2: String,
      reference: Data.reference
    }],
    birthdate: String,
    birthdate_as_iso_date: Date,
    birthplace: Number,
    cev_id: String,
    client_creation_date: String,
    client_creation_iso_date: Date,
    clinic: String,
    country_id: Number,
    curp: Person.curp,
    father_surname: Person.primer_apellido,
    first_name: Person.nombre,
    gender: Person.sexo,
    mother_surname: Person.segundo_apellido,
    patient: [
      String
    ],
    phones: [{
      type: {
        type: String,
      },
      telephone_number: String,
      provider: String
    }],
    professional_license: String,
    rfc: Person.rfc,
    fecha_creacion: Data.fecha_creacion,
    modified: Date
  },
  fecha_creacion: Data.fecha_creacion,
  modified: Date
});


// Hash the contrasena before the user be saved
DeletedUserSchema.pre('save', function(next) {
  var user = this;

  // Hash the contrasena only if the contrasena has been changed or the user is new
  if (!user.isModified('contrasena')) {
    return next();
  }

  user.contrasena = this.decrypt(user.contrasena);

  // Generate the hash
  bcrypt.hash(user.contrasena, null, null, function(err, hash) {
    if (err) {
      return next(err);
    }

    // Change the contrasena to the hashed version
    user.contrasena = hash;
    next();
  });
});


// Compare a given contrasena with the database hash
DeletedUserSchema.methods.comparePassword = function(contrasena) {
  try {
    return bcrypt.compareSync(contrasena, this.contrasena);
  } catch(e) {
    return false;
  }
};


// Decrypt using CBC mode
DeletedUserSchema.methods.decrypt = function(contrasena) {
  var decipher = forge.cipher.createDecipher('AES-CBC', config.aes_key);

  try {
    var encodedPassword = base64.decode(contrasena);
  } catch(e) {
    return false;
  }

  var encrypted = forge.util.createBuffer(encodedPassword);

  decipher.start({iv: config.aes_iv});
  decipher.update(encrypted);
  decipher.finish();

  return decipher.output.data.toString('utf8');
};


// Create the 'DeletedUser' model out of the 'DeletedUserSchema'
mongoose.model('DeletedUser', DeletedUserSchema);
