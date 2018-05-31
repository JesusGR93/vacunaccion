// Invoke 'strict' JavaScript mode
'use strict';


var mongoose = require('mongoose');
var Cev = mongoose.model('Cev');
var tools = require('./tools.server.controller');
var fs = require('fs');
var log = require('../../config/log/vacunaccionLog.js');

var itemsPerPage = 10;

exports.create = function (req, res, next) {
  req.object.save(function (err, person) {
    if (err) {
      log.logError('Error al guardar' + err);
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }

    else if (req.credential && req.credential.rol.toLowerCase() === 'admin' ||
      req.credential && req.credential.rol.toLowerCase() === 'doctor' ||
      req.credential && req.credential.rol.toLowerCase() === 'tutor' ||
      req.trash && req.trash === true) {
      next();

    } else {
      log.logInfo('Se registro correctamente _id : '+  req.object._id );
      return res.status(201).json({
        success: true,
        message: 'Registro creado exitósamente',
        data: {
          patient_id: req.object._id,
          tutor: req.object.tutor
        }

      });
     
    }
  });
};

exports.createClinic = function (req, res, next) {
  req.object.save(function (err) {

    if (err) {
      var msg = 'E11000 duplicate key error collection: cev-protegelos.' +
        'clinics index: id_1 dup key';
      if (err.errmsg && err.errmsg.indexOf(msg) > -1) {
        var clinic = mongoose.model('Clinic');

        clinic.findOne({ id: req.object.id }, function (err, doc) {
          if (err) {
            return res.status(400).send({
              success: false,
              message: tools.getErrorMessage(err)
            });
          }

          return res.json({
            success: true,
            message: 'Registro existente',
            data: doc
          });

        });
        next();
      } else {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      }
    } else {
      if (req.credential && req.credential.rol.toLowerCase() === 'admin' ||
        req.credential && req.credential.rol.toLowerCase() === 'doctor' ||
        req.credential && req.credential.rol.toLowerCase() === 'tutor' ||
        req.trash && req.trash === true) {

        next();
      } else {
        next();

        return res.status(201).json({
          success: true,
          message: 'Registro creado exitósamente',
          data: {
            _id: req.object._id
          }

        });

      }

    }

  });

};


exports.createClinicDoctor = function (req, res, next) {
  if(!req.clinic){
 next();
  }else{
  req.clinic.save(function (err) {

    if (err) {
      var msg = 'E11000 duplicate key error collection: cev-protegelos.' +
        'clinics index: id_1 dup key';
      if (err.errmsg && err.errmsg.indexOf(msg) > -1) {
        var clinic = mongoose.model('Clinic');

        clinic.findOne({ id: req.clinic.id }, function (err, doc) {
          if (err) {
            return res.status(400).send({
              success: false,
              message: tools.getErrorMessage(err)
            });
          }


        });
       
        next();
      } else {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      }
    } else {
      if (req.credential && req.credential.rol.toLowerCase() === 'admin' ||
        req.credential && req.credential.rol.toLowerCase() === 'doctor' ||
        req.credential && req.credential.rol.toLowerCase() === 'tutor' ||
        req.trash && req.trash === true) {
        next();
      } else {
       
        next();

        

      }

    }

  });
  }
};

exports.createVaccinesControl = function (req, res, next) {
  req.object.save(function (err, vaccine) {

    return res.status(201).json({
      success: true,
      message: 'Registro creado exitósamente',
      data: {
        _id: req.object._id,
      }

    });

  })
};


exports.createCev = function (req, res, next) {
  if (req.body.masked_id) {
    var cev = new Cev({
      masked_id: req.body.masked_id
    });

    cev.save(function (err, cev) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      }

      req.object.masked_id = cev._id;

      next();
    });
  } else {
    next();
  }
};


exports.createUser = function (req, res, next) {
  req.credential.save(function (err, user) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }

    var data = {
      _id: req.credential._id
    };

    if (req.credential.rol === 'doctor' || req.credential.rol === 'tutor') {
      data.token = tools.signToken(req, req.credential._id,
        req.credential.rol, req.object.first_name, req.object.father_surname,
        req.object.mother_surname);
      next();
    }

    return res.status(201).json({
      success: true,
      message: 'Registro creado exitósamente',
      data: data

    });

  });
};

exports.createBitacoraUser = function (req, res, next) {
  req.bitacora.save(function (err) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }
  });
};




exports.createtelefonos = function (req, res, next) {
  req.object.save(function (err,objDireccionesModel) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Registro creado exitósamente',
      data: objDireccionesModel._doc
    });

  });
};






exports.createDirecciones = function (req, res, next) {
  req.object.save(function (err,objDireccionesModel) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Registro creado exitósamente',
      data: objDireccionesModel._doc

    });

  });
};

exports.createrelresponsablecontacto = function (req, res, next) {
  req.object.save(function (err,objrelresponsablecontacto) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Registro creado exitósamente',
      data: objrelresponsablecontacto._doc

    });
  });
};




/*
 * To retrieve all the documents in the model.
 * Used to retrieve the catalogs.
*/
exports.readAll = function (req, res) {
  req.model.find()
    .select(req.select)
    .lean()
    .exec(function (err, object) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      } else {
        return res.json({
          success: true,
          data: object
        });
      }
    });
};


exports.readAllDosageVaccine = function (req, res) {
  req.model.find()
    .select(req.select)
    .populate(req.populate)
    .lean()
    .exec(function (err, object) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      } else {
        return res.json({
          success: true,
          data: object
        });
      }
    });
};

/*
 * To find filtered by exactly the parameters given
 * Used to read the municapality filtered by state.
 * and the localities filtered by state and municipality. 
*/
exports.find = function (req, res) {
  req.model.find(req.params)
    .select(req.select)
    .exec(function (err, object) {
      if (err) {
        return res.status(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      } else {
        return res.status(200).json({
          success: true,
          data: object
        });
      }
    });
};


/*
 * Find by icontains (attribute_1) AND icontains (attribute_2)... AND icontains (attribute_n).
 * Used to get admins, tutors and doctors.
 * If not parameters for searching, return all documents (paginated).
*/
exports.findPersonsByIcontains = function (req, res) {

  var totalItems, sortValue;
  var query = [];
  var q = {};

  // Get the keys in req.query and delete the atribute page
  var keys = Object.keys(req.query);
  var page = req.query.page;
  var index = keys.indexOf('page');

  if (index > -1) {
    keys.splice(index, 1);
  }

  // If length is no null then build the query.
  if (keys.length !== 0) {
    for (var i = 0; i < keys.length; i++) {
      q = {};
      q[keys[i]] = new RegExp(req.query[keys[i]], "i");
      query.push(q);
    }

    query = { $and: query };
  } else {
    query = {};
  }

  sortValue = 'father_surname';

  // Get the total documents to pagination.
  req.subModel.count(query, function (err, count) {
    totalItems = count;
  });

  // Search the user documents.
  req.subModel.find(query)
    .select(req.select)
    .sort(sortValue)
    .exec(function (err, personArray) {
      if (err) {
        return res.sfindPersonsByIcontainstatus(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      } else {
        if (req.subModel.modelName === 'Patient') {
          return res.send({
            success: true,
            data: personArray,
            pagination: {
              'currentPage': page,
              'itemsPerPage': itemsPerPage,
              'totalItems': totalItems
            }
          });
        }

        var ids = personArray.map(function (obj) {
          return obj._id;
        });

        req.model.find({ 'user': { $in: ids } })
          .select(req.select)
          .populate(req.populate)
          .exec(function (err, userArray) {

            if (err) {
              return res.status(400).send({
                success: false,
                message: tools.getErrorMessage(err)
              });
            } else {

              if (req.subModel.modelName === 'Admin') {
                return res.send({
                  success: true,
                  data: userArray,
                  pagination: {
                    'currentPage': page,
                    'itemsPerPage': itemsPerPage,
                    'totalItems': totalItems
                  }
                });
              }

              var data = personArray.map(function (person) {
                for (var i = 0; i < userArray.length; i++) {
                  if (person._id.toString() === userArray[i].user._id.toString()) {
                    return userArray[i];
                  }
                }

                return {
                  _id: 'sin_credenciales',
                  user: person,
                  correo: "Registro incorrecto."
                }

              });

              return res.send({
                success: true,
                data: data,
                pagination: {
                  'currentPage': page,
                  'itemsPerPage': itemsPerPage,
                  'totalItems': totalItems
                }
              });
            }
          });
      }
    });
}


/*
 * Find by icontains (attribute_1) AND icontains (attribute_2)... AND icontains (attribute_n).
 * If not parameters for searching, return all documents (paginated).
*/
exports.findClinicsByIcontain = function (req, res) {

  var totalItems;
  var query = {};
  var page = req.query.page;
  var sortValue = 'name';

  var queryKeys = Object.keys(req.query);
  var queryAvoid = ["name"]

  // if doctor add in the query the doctor reference to searching
  // if (req.decoded.rol === 'doctor' ) {
  // var query = {'_id': req.decoded.id};
  //}

  for (var i = 0; i < queryAvoid.length; i++) {
    if (queryKeys.indexOf(queryAvoid[i]) > -1) {
      query[queryAvoid[i]] = new RegExp(req.query[queryAvoid[i]], "i");
    }
  }

  // Get the total documents to pagination.
  req.model.count(query, function (err, count) {
    totalItems = count;
  });

  // Search the user documents.
  req.model.find(query)
    .select(req.select)
    .populate(req.populate)
    .sort(sortValue)
    .exec(function (err, personArray) {

      if (err) {
        return res.findClinicsByIcontain(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });
      } else {
        return res.send({
          success: true,
          data: personArray,
          pagination: {
            'currentPage': page,
            'itemsPerPage': itemsPerPage,
            'totalItems': totalItems
          }
        });
      }
    });

}


/*
 * Used to find patients used by admins and doctor rol.
 * If is used by doctors find by doctor reference and if the 
 * req.query have atributes given also by queryAvoid are used to find it by icontains.
 * If not parameters for searching, return all documents.
*/
exports.findPatients = function (req, res) {

  var totalItems;
  var query = {};
  var page = req.query.page;
  var sortValue = 'father_surname';

  var queryKeys = Object.keys(req.query);
  var queryAvoid = ["father_surname", "mother_surname", 'first_name']

  // if doctor add in the query the tutor reference to searching
  if (req.decoded.rol === 'doctor') {
    var query = { 'doctor': req.decoded.id };
  }

  for (var i = 0; i < queryAvoid.length; i++) {
    if (queryKeys.indexOf(queryAvoid[i]) > -1) {
      query[queryAvoid[i]] = new RegExp(req.query[queryAvoid[i]], "i");
    }
  }

  req.subModel.count(query, function (err, count) {
    totalItems = count;
  });

  // Search the patient documents.
  req.subModel.find(query)
    .select(req.select)
    .populate(req.populate)
    .sort(sortValue)
    .exec(function (err, personArray) {
      if (err) {

        return res.findPatientByDoctorRefOrTutorRef(400).send({
          success: false,
          message: tools.getErrorMessage(err)
        });

      } else {

        return res.send({
          success: true,
          data: personArray,
          pagination: {
            'currentPage': page,
            'itemsPerPage': itemsPerPage,
            'totalItems': totalItems
          }

        })
      }

    });
}


exports.update = function (req, res, next) {
  var admin = mongoose.model('Admin');
  req.object.isNew = false;

  req.object.save(req.object, function (err) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    } else {
      if (req.object.user) {
        admin.findOneAndUpdate({ _id: req.object.user._id }, req.admin,
          function (err) {
            if (err) {
              return res.status(400).send({
                success: false,
                message: tools.getErrorMessage(err)
              });
            }

          });
      }
      next();
      if (req.finish) {
        return res.status(200).json({
          success: true,
          message: 'Actualización exitosa'
        });
      } else {
        next();
      }

    }

  });
};


exports.delete = function (req, res, next) {
  req.oldObject.remove(function (err) {
    if (err) {
      return res.status(400).send({
        success: false,
        message: tools.getErrorMessage(err)
      });
    }

    return res.send({
      success: true,
      message: 'Registro eliminado exitósamente'
    });
  });
  next();
};


exports.oneObjectById = function (req, res, err, object, next) {
  if (err) {
    return res.status(400).send({
      success: false,
      message: tools.getErrorMessage(err) || 'Error de petición'
    });
  }

  if (!object) {
    return res.status(400).send({
      success: false,
      message: 'Documento no existente'
    });
  }

  req.object = object;

  next();
};


exports.savePicture = function (req, res, entity, next) {
  var filename;
  var uploadsPath = "./public/uploads/";
  var filePath = uploadsPath + entity + "s/";
  var buff;

  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
  }

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }

  filename = tools.removeDiacritics(req.body.name).split(" ");

  var temp = "";
  for (var i = 0; i < filename.length; i++) {
    temp += filename[i].toLowerCase() + "-";
  }

  filename = temp +
    Date.now() +
    "-" + req.body.picture.name;

  buff = new Buffer(req.body.picture.file
    .replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

  fs.writeFile(filePath + filename, buff,
    function (err) {
      if (err) {
        return res.status(200).json({
          success: false,
          err: err
        });
      } else {
        req.object.picture = {
          filename: filename,
          path: entity
        };
        next();
      }
    }
  );
};
