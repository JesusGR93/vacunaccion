/* jslint node: true */

// Invoke 'strict' JavaScript mode
'use strict';

// Set the 'NODE_ENV' variable
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load the module dependencies
var express = require('./config/express');
var mongoose = require('./config/mongoose');
var log=require('./config/log/vacunaccionLog.js');
// Create a new Mongoose application instance
var db = mongoose();

// Create a new Express application instance
var app = express();

// Use the Express application instance to listen to the '8088' port
app.listen(8088);
log.logInfo('Server running at http://localhost:8088/');
// Use the module.exports property to expose the Express application instance
// for external use
module.exports = app;
