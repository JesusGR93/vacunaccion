// Invoke 'strict' JavaScript mode
'use strict';


// Load the Mongoose module and Schema object
var Data = require('./data.server.model');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var catclinicasSchema = new Schema({
    id_clinica: {
      type: Number
    },
    nombre:{
      type:String
    },
    id_estado:{
      type:Number
    },
    id_municipio:{
      type: Number
    },
    id_localidad:{
      type:Number
    },
    codigo_postal:{
      type:String
    },
    fecha_registro_app:{
      type: Date
    },
    fecha_registro:{
      type: Date
    },
    fecha_ultima_modificacion:{
      type:Date
    },
    fecha_eliminacion:{
      type:Date
    }



});




// Define a new 'ClinicSchema'
// var ClinicSchema = new Schema({
//   id: {
//     type: String,
//     maxlength: 50,
//     trim: true,
//     required: Data.msgRequired('Clave'),
//     index: {
//       unique: true
//     }
//   },
//   name: {
//     type: String,
//     maxlength: 50,
//     trim: true,
//     required: Data.msgRequired('Nombre')
//   },
//   address: [{
//     state_id : Data.state_id,
//     municipality_id: Data.municipality_id,
//     locality_id: Data.locality_id,
//     zip_code: Data.zipCode
//   }],
//   fecha_creacion: Data.fecha_creacion,
//   delete:Data.delete,
//   status:{
//     type: Number,
//     trim: true,
//     enum: [0, 1]
//   },
//   modified: Date
// });


// catclinicasSchema.pre('save', function(next) {

//    var clinic = this;
//    var Municipality = mongoose.model('Municipality');
//    var Locality = mongoose.model('Locality');
//    var j = 0;

// });

  // for (var i = 0; i < clinic.address.length; i++) {
  //   var address = clinic.address[i];
  //   var params = {
  //     state_id: address.state_id,
  //     municipality_id: address.municipality_id,
  //     id: address.locality_id
  //   };

//     Locality.findOne(params, function(err, locality) {
//       if (err) {
//         return res.status(400).send({
//           success: false,
//           message: tools.getErrorMessage(err)
//         });
//       }

//       for (var x = 0; x < clinic.address.length; x++) {
//         if (clinic.address[x].locality_id == locality.id) {
//           clinic.address[x].locality_id = locality._id;
//         }
//       }

//       var params = {
//         state_id: locality.state_id,
//         id: locality.municipality_id
//       };

//       Municipality.findOne(params, function(err, municipality) {
       
//         if (err) {
//           return res.status(400).send({
//             success: false,
//             message: tools.getErrorMessage(err)
//           });
//         }

//         for (var x = 0; x < clinic.address.length; x++) {
//           if (clinic.address[x].municipality_id == municipality.id) {
//             clinic.address[x].municipality_id = municipality._id;
//           }
//         }

//         j++;
//         if (j === clinic.address.length) {
//           next();
//         }
//       });
//     });
//   }
// });


// Create the 'Clinic' model out of the 'ClinicSchema'
mongoose.model('cat_clinicas', catclinicasSchema);
