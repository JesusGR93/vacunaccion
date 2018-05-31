// Invoke 'strict' JavaScript mode
'use strict';

var mongoose = require('mongoose');
var Model = mongoose.model('Admin');
var Medico = mongoose.model('Medico');
var Responsable = mongoose.model('responsables');
var User = mongoose.model('detalle_usuario');
var trashModel = mongoose.model('DeletedUser');
var Data = require('../models/data.server.model');
var tools = require('./tools.server.controller');
var crud = require('./crud.server.controller');
var config = require('../../config/config');
var Bitacora = mongoose.model('Binnacleuser');
var log = require('../../config/log/vacunaccionLog.js');
var environmentParam = 1;
var ip = "";
var validacionDoctor = 1;
var validacionResponsable = 2;
var validacionAdmin = 3;
function environmentVacun(x) {
  switch (environmentParam) {
    case 0:
      ip = 'http://localhost:8088';
      break;
    case 1:
      ip = 'http://40.84.190.53';
      break;
    case 2:
      ip = 'http://vacunaccion.net';
      break;
  }
  return ip;
}

// Create the 'login' controller method
exports.login = function (req, res, next) {
  if (!req.body.correo || !req.body.contrasena) {
    return res.json({
      success: false,
      message: 'Argumentos no válidos'
    });
  }

  User.findOne({ correo: req.body.correo.toLowerCase() }, function (err, user) {
    if (err) {
      log.logError('Error al buscar el user: ' + err);
      var error = tools.getErrorMessage(err);
      return res.json(error);
    } else {
      // Check user/contrasena

      if (!existUser(res, user)) {

        var contrasena = user.decrypt(req.body.contrasena);

        if (!user.comparePassword(contrasena)) {

          return res.json({
            success: false,
            message: 'Usuario/contraseña incorrecta'
          });
        }
        log.logInfo("Usuario Logeado: " + req.body.correo.toLowerCase() + " id:" + user._id);
        var medico;
        var responsable;
        if (user._doc.rol === validacionDoctor) {
          Medico.findOne({ _id: user._doc.id_usuario }, function (err, medicoBD) {
            if (err) {
              return res.json({
                success: false,
                message: 'Ocurrio un error al buscar el detalle del usuario (Doctor).'
              });
            }
            medico = medicoBD;
            return generateToken(req, res, user._id, user.rol, user.first_name,
              user.father_surname, user.mother_surname, medico);
          });
        }

        if (user._doc.rol === validacionResponsable) {
          Responsable.findOne({ _id: user._doc.id_usuario }, function (err, medicoBD) {
            if (err) {
              return res.json({
                success: false,
                message: 'Ocurrio un error al buscar el detalle del usuario(Responsable).'
              });
            }
            responsable = medicoBD;
            return generateToken(req, res, user._id, user.rol, user.first_name,
              user.father_surname, user.mother_surname, responsable);
          });
        }

        if (user._doc.rol === validacionAdmin) {
          Responsable.findOne({ _id: user._doc.id_usuario }, function (err, medicoBD) {
            if (err) {
              return res.json({
                success: false,
                message: 'Ocurrio un error al buscar el detalle del usuario(Responsable).'
              });
            }
            medico = medicoBD;
            return generateToken(req, res, user._id, user.rol, user.first_name,
              user.father_surname, user.mother_surname, medico);
          });
        }

        //return generateToken(req, res, user._id, user.rol, user.first_name, user.father_surname, user.mother_surname);
      }
    }
  }).select('_id correo  contrasena rol red_social url_token validacion url_activada id_usuario id_dispositivo id_autonumerico');
};

// Create the 'login' controller method
exports.loginsocialnet = function (req, res, next) {
  if (!req.body.correo || !req.body.img || !req.body.rol) {
    return res.json({
      success: false,
      message: 'Argumentos no válidos'
    });
  }

  User.findOne({ correo: req.body.correo.toLowerCase() }, function (err, user) {

    if (err) {
      log.logError('Error al buscar el user: ' + err);
      var error = tools.getErrorMessage(err);
      return res.json(error);
    } else {

      if (!existUserLoginSocialNet(user, req, res, next)) {

        log.logInfo("Usuario Logeado:" + req.body.correo.toLowerCase());

      }

    }

  });


};

var existUser = function (res, user) {
  if (!user) {
    return res.json({
      success: false,
      message: 'El usuario no se encuentra registrado'
    });
  }
};

var existUserLoginSocialNet = function (user, req, res, next) {
  var strDoctor = 'doctor';
  var strTutor = 'tutor';
  if (!user) {
    var User = mongoose.model('detalle_usuario');
    var DoctorModel = mongoose.model('Medico');
    var TutorModel = mongoose.model('responsables');
    var UserSocialNet = mongoose.model('detalle_usuario');
    var DoctorObj = mongoose.model('Medico');
    var TutorObj = mongoose.model('responsables');
    var token = generateUrlToken();
    UserSocialNet.correo = req.body.correo;
    UserSocialNet.contrasena = "uohipjWJMCT3Qltf5A9Ziw==";
    UserSocialNet.img = req.body.img;
    UserSocialNet.rol = req.body.rol;
    UserSocialNet.url_activada = token;
    UserSocialNet.first_name = req.body.first_name;
    UserSocialNet.father_surname = req.body.father_surname;
    UserSocialNet.mother_surname = req.body.mother_surname;
    UserSocialNet.validacion = 88;
    UserSocialNet.id_usuario = 'id usuario de cev';
    UserSocialNet.id_dispositivo = 'id del dispositivo';
    UserSocialNet.id_autonumerico = 8866688;

    var userModel = new User(UserSocialNet);

    userModel.save(function (err, usersn) {
      if (err) {
        log.logError('Error al buscar el userModel: ' + err);
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      } else {
        var from = 'CEV-Protegelos';
        var to = req.body.correo;
        var subject = 'Activar cuenta de usuario';
        var linkParametric = environmentVacun(environmentParam);
        var link = linkParametric + '/api/v1/users/activate/?url_activada=' + token;
        var html = 'Recibimos una solicitud para activar tu cuenta de usuario de la aplicación móvil Vaccunaccion. <br>' +
          'Para activar la cuenta oprime: <br><br>' +
          '<a href="' + link + '"> Sí, quiero activar mi cuenta </a> <br><br>'


        if (!tools.sendEmailSocialNet(req, res, from, to, subject, html)) {


          log.logInfo("usuario registrado por Red Social:" + req.body.correo);
        }
      }
    });

    req.bitacora = new Bitacora({
      origin: 1,
      origin_update: 1,
      validated: 1,
      user: userModel._id,
      correo: req.body.correo,
      description: "Nuevo usuario por red social"
    });

    next();
  } else {
    var medico;
    var responsable;
    if (!user.url_activada) {
      if (!user.status_validate && user.status_validate !== 1) {
        return res.json({
          success: true,
          message: 'Este correo ya se encuentra registrado.'
        });
      } else {

        if (user._doc.rol === validacionDoctor) {
          Medico.findOne({ _id: user._doc.id_usuario }, function (err, medicoBD) {
            if (err) {
              return res.json({
                success: false,
                message: 'Ocurrio un error al buscar el detalle del usuario (Doctor).'
              });
            }
            medico = medicoBD;
            return generateToken(req, res, user._id, user.rol, user.first_name,
              user.father_surname, user.mother_surname, medico);
          });
        }

        if (user._doc.rol === validacionResponsable) {
          Responsable.findOne({ _id: user._doc.id_usuario }, function (err, medicoBD) {
            if (err) {
              return res.json({
                success: false,
                message: 'Ocurrio un error al buscar el detalle del usuario(Responsable).'
              });
            }
            responsable = medicoBD;
            return generateToken(req, res, user._id, user.rol, user.first_name,
              user.father_surname, user.mother_surname, responsable);
          });
        }





      }

    } else {
      return res.json({
        success: true,
        message: 'Por favor valida la cuenta vía correo électronico.'
      });
    }

  }

};

// Create a JSON Web Token (JWT)
var generateToken = function (req, res, id, rol, first_name, father_surname,
  mother_surname, detalleUsuarioID) {
  var token = tools.signToken(req, id, rol, first_name, father_surname,
    mother_surname);
  return res.json({
    success: true,
    message: 'Autenticación exitosa',
    data: {
      token: token,
      usuario: detalleUsuarioID
    }
  });
};

var generateTokenSocialNet = function (req, id, rol, first_name, father_surname,
  mother_surname) {
  var token = tools.signToken(req, id, rol, first_name, father_surname,
    mother_surname);

  return res.json({
    success: true,
    message: 'Autenticación exitosa',
    data: {
      token: token
    }
  });
};

// Export JWT generation method
exports.generateToken = function (req, res, id, rol, firstName, surname,
  motherSurname, detalleUsuarioID) {
  return generateToken(req, res, id, rol, firstName, surname, motherSurname, detalleUsuarioID)
};

exports.recoverPassword = function (req, res) {
  if (!req.body.correo) {
    return res.json({
      success: false,
      message: 'Argumentos no válidos'
    });
  }

  // Temporary patch for logging by social network
  User.findOne({ correo: req.body.correo.toLowerCase() }, function (err, user) {
    if (err) {
      log.logError('Error al buscar el User: ' + err);
      var error = tools.getErrorMessage(err);
      return res.json(error);
    }

    if (user && user.red_social) {
      return res.json({
        success: true,
        message: 'No es posible recuperar el contrasena ya que te registraste ' + 'por red social'
      });
      log.logWarn("No es posible recuperar el contrasena ya que te registraste por red social user:"
        + req.body.correo);
    }

    var token = generateUrlToken();
    // Save the one-time access link
    saveUrlToken(req, res, token);
  });
};

var generateUrlToken = function () {
  var crypto = require('crypto');
  var length = 17;

  return crypto.randomBytes(Math.ceil(length * 3 / 4))
    .toString('base64')
    .slice(0, length)
    .replace(/\+/g, 'X')
    .replace(/\//g, 'w');
};

var saveUrlToken = function (req, res, token) {

  User.findOne({ correo: req.body.correo.toLowerCase() }, function (err, user) {
    if (err) {
      log.logError('Error al buscar el User: ' + err);
      var error = tools.getErrorMessage(err);
      return res.json(error);
    }

    if (!existUser(res, user)) {
      user.url_token = token;
      User.findOneAndUpdate({ _id: user._id }, user, function (err) {
        if (err) {
          var error = tools.getErrorMessage(err);
          return res.json(error);
        }

        // After saving the token, the correo will be sent
        var from = 'CEV-Protegelos';
        var to = req.body.correo;
        var subject = 'Restablecer contraseña';
        var linkParametric = environmentVacun(environmentParam);
        var link = linkParametric + '/#!/reset/' + token;
        var html = 'Recibimos una solicitud para restablecer lsa contraseña de la aplicación móvil Protégelos. <br>' +
          'Para restablecer la contraseña oprime: <br><br>' +
          '<a href="' + link + '"> Sí, quiero restablecer mi contraseña </a> <br><br>' +
          'Si tu no realizaste esta solicitud haz caso omiso a este mensaje. Ésto no representa ningún riesgo de seguridad.';

        tools.sendEmail(req, res, from, to, subject, html);
        log.logInfo('Restablecer contraseña del usuario:' + user.correo);
      });
    }
  });
};

exports.activate = function (req, res) {

  if (!req.query.url_activada) {
    return res.json({
      success: false,
      message: 'Argumentos no válidos'
    });
  }

  var tokenActivate = req.query.url_activada;

  // Check if the token is valid
  User.findOne({ url_activada: req.query.url_activada }, function (err, user) {
    if (err) {
      log.logError('Error al buscar el User: ' + err);
      var error = tools.getErrorMessage(err);
      return res.json(error);
    } else {
      if (!user) {
        return res.json({
          success: false,
          message: 'No fue posible recuperar su información. Favor de intentar de nuevo.'
        });
      }

      // Delete the URL token
      user.status_validate = 1;
      user.url_activada = undefined;

      user.save(function (err) {
        if (err) {
          var error = tools.getErrorMessage(err);
          return res.json(error);
        } else {
          return res.redirect('http://vacunaccion.net');
        }
      });
    }
  }).select('');

};

exports.activateuser = function (req, res) {
  if (!req.body.correo) {
    return res.json({
      success: false,
      message: 'Argumentos no válidos'
    });
  }
  var token = generateUrlToken();

  saveUrlTokenActivateUser(req, res, token);

}

var saveUrlTokenActivateUser = function (req, res, token) {

  var usertok = mongoose.model('detalle_usuario');
  usertok.url_activada = token;
  User.findOneAndUpdate({ correo: req.body.correo }, usertok, function (err) {
    if (err) {
      log.logError('Error al buscar el User: ' + err);
      var error = tools.getErrorMessage(err);
      return res.json(error);
    }

    // After saving the token, the correo will be sent
    var from = 'CEV-Protegelos';
    var to = req.body.correo;
    var subject = 'Activar cuenta de usuario';
    var linkParametric = environmentVacun(environmentParam);
    var link = linkParametric + '/api/v1/users/activate/?url_activada=' + token;
    'Para activar la cuenta oprime: <br><br>' +
      '<a href="' + link + '"> Sí, quiero activar mi cuenta </a> <br><br>'
    tools.sendEmail(req, res, from, to, subject, html);
    log.logInfo('Activar cuenta de usuario del usuario:' + user.correo);
  });

};


exports.restorePassword = function (req, res) {
  if (req.body.password) {
    req.body.contrasena = req.body.password;
  }
  if (!req.body.contrasena || !req.body.url_token) {
    return res.json({
      success: false,
      message: 'Argumentos no válidos'
    });
  }

  // Check if the token is valid
  User.findOne({ url_token: req.body.url_token }, function (err, user) {
    if (err) {
      log.logError('Error al buscar el User: ' + err);
      var error = tools.getErrorMessage(err);
      return res.json(error);
    } else {
      if (!user) {
        return res.json({
          success: false,
          message: 'No fue posible recuperar su información. Favor de intentar de nuevo.'
        });
      }

      // Delete the URL token
      user.contrasena = req.body.contrasena;
      user.url_token = undefined;

      user.save(function (err,userModificado) {
        if (err) {
          var error = tools.getErrorMessage(err);
          return res.json(error);
        } else {
          log.logInfo('usuario actualizado correctamente:' + userModificado._doc._id);
          return res.status(201).send({
            success: true,
            message: 'Contraseña actualizada correctamente'
          });
        }
      });
    }
  }).select('');
};

// Create the objects for saving the entity in user's and admin's collections
exports.create = function (req, res, next) {
  req.object = new Model({
    first_name: req.body.first_name,
    father_surname: req.body.father_surname,
    mother_surname: req.body.mother_surname
  });

  req.credential = new User({
    correo: req.body.correo.toLowerCase(),
    contrasena: req.body.contrasena,
    rol: req.body.rol,
    user: req.object._id
  });

  next();
};


exports.findOne = function (req, res, next, id) {

  var populate = [{
    path: 'user',
    select: '-__v -fecha_creacion',
    model: 'Admin'
  }];

  User.findById(id)
    .select('-__v -fecha_creacion')
    .populate(populate)
    .exec(function (err, object) {
      crud.oneObjectById(req, res, err, object, next);
    });

};


exports.readOne = function (req, res, next) {
  return res.send({
    success: true,
    data: req.object
  });
};


exports.findList = function (req, res, next) {
  req.model = User;
  req.subModel = Model;
  req.select = 'correo user';
  req.populate = [{
    path: 'user',
    select: 'first_name father_surname mother_surname -_id',
    model: 'Admin'
  }];

  next();
};


exports.update = function (req, res, next) {
  var modified = new Date();
  req.admin = {};

  if (req.body.first_name) {
    req.admin.first_name = req.body.first_name;
  }

  if (req.body.father_surname) {
    req.admin.father_surname = req.body.father_surname;
  }

  if (req.body.mother_surname) {
    req.admin.mother_surname = req.body.mother_surname;
  }

  req.admin.modified = modified;

  if (req.body.correo) {
    req.object.correo = req.body.correo.toLowerCase();
  }

  if (req.body.contrasena) {
    req.object.contrasena = req.body.contrasena;
  }

  req.object.modified = modified;

  req.finish = true;

  next();
};


exports.delete = function (req, res, next) {
  // It's required to copy the req.object element by element instead of only
  // change it to the trash model in order to avoid the error:
  // 'VersionError: No matching document found for id'
  var deletedUser = {};

  deletedUser.correo = req.object.correo;
  deletedUser.rol = req.object.rol;
  deletedUser.red_social = req.object.red_social;
  deletedUser.url_token = req.object.url_token;
  deletedUser.user = {};
  deletedUser.user.first_name = req.object.user.first_name;
  deletedUser.user.father_surname = req.object.user.father_surname;
  deletedUser.user.mother_surname = req.object.user.mother_surname;
  deletedUser.user.fecha_creacion = req.object.user.fecha_creacion;
  deletedUser.user.modified = req.object.user.modified;
  deletedUser.fecha_creacion = req.object.fecha_creacion;
  deletedUser.modified = req.object.modified;

  req.oldObject = req.object;
  req.object = new trashModel(deletedUser);
  req.trash = true;

  next();
};

