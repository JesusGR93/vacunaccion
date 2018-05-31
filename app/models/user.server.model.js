// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Schema object
var base64 = require('base-64');
var bcrypt = require('bcrypt-nodejs');
var config = require('../../config/config');
var Data = require('./data.server.model');
var forge = require('node-forge');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DoctorModel = mongoose.model('Medico');
var TutorModel = mongoose.model('responsables');
var AdminModel = mongoose.model('Admin');

// Define a new 'UserSchema'
var UserSchema = new Schema({
  correo: {
    type: String,
    required: Data.msgRequired('Correo electrónico'),
    maxlength: 50,
    trim: true,
    match: [/.+\@.+\..+/, Data.msgValidFormat('Correo electrónico')],
    index: {
      unique: true
    }
  },
  contrasena: {
    type: String,
    required: Data.msgRequired('Contraseña'),
    trim: true,
    minlength: 6,
    // The contrasena won't be returned when users are listed
    select: false,
    validate: [
      function(contrasena) {
        var decryptedPassword = this.decrypt(contrasena);

        return decryptedPassword.length >= 6;
      },
      'Error al descifrar la contraseña'
    ]
  },
  rol: {
    type: Number,
    trim: true,
    require: Data.msgRequired('Rol')
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
  status_validate: {
    type: Number,
    trim: true
  },
  validacion: {
    type: Number,
    trim: true
  },
  img: {
    type: String,
    trim: true
  },
  id_usuario: {
    type: String,
    trim: true
  },
  id_dispositivo: {
    type: String,
    trim: true
  },
  id_autonumerico: {
    type: Number,
    trim: true
  },
  url_activada: {
    type: String,
    trim: true,
    match: [/^[A-Za-z0-9]{17}$/, Data.msgValidFormat('url_activada activate')]
  },
  user: {
    type: Schema.ObjectId,
    ref: 'detalle_usuario'
  },
  fecha_creacion: Data.fecha_creacion,
  modified: Date,
  status:Number
});

// Hash the contrasena before the user be saved
UserSchema.pre('save', function(next) {
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
UserSchema.methods.comparePassword = function(contrasena) {
  try {
    return bcrypt.compareSync(contrasena, this.contrasena);
  } catch(e) {
    return false;
  }
};


// Decrypt using CBC mode
UserSchema.methods.decrypt = function(contrasena) {

  var passAdmin = "Zq217xTRXG+vs+w+Yninjg==";
  //var passAdmin = "wAc88XGpGFJXnZKRladRYg==";
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


UserSchema.post('remove', function(doc) {

  if (doc.rol === 'doctor') {
    DoctorModel.remove({_id: doc.user._id}).exec();
  }
  if (doc.rol === 'tutor') {
    TutorModel.remove({_id: doc.user._id}).exec();
  }
  if (doc.rol === 'admin') {
    AdminModel.remove({_id: doc.user._id}).exec();
  }
});

// Create the 'User' model out of the 'UserSchema'
mongoose.model('detalle_usuario', UserSchema);