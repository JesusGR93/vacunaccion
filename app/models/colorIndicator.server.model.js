// Load the Mongoose module and Schema object
var Data = require('./data.server.model.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ColorIndicatorSchema = new Schema({
  _id:            Number,
  name:{
    type:         String,
    required:     Data.msgRequired('Nombre de vacuna [name]'),
    maxlength:    20,
    trim:         true
  },
  id_version:{type:Number}
});

ColorIndicatorSchema.set('toJSON',
  {
    getters: true,
    virtuals: true
  }
);

mongoose.model('ColorIndicator', ColorIndicatorSchema);
