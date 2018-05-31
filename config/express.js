// Invoke 'strict' JavaScript mode
'use strict';


// Load the module dependencies
var bodyParser = require('body-parser');
var compress = require('compression');
var config = require('./config');
var express = require('express');
var methodOverride = require('method-override');
var morgan = require('morgan');


module.exports = function() {
  // Create a new Express application instance
  var app = express();

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else if (process.env.NODE_ENV === 'production') {
	  // Log file rotation
	  var fileStreamRotator = require('file-stream-rotator');
		var fs = require('fs');
		var logDirectory = __dirname + '/log';

	  // Ensure log directory exists
	  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

	  // Create a rotating write stream
	  var accessLogStream = fileStreamRotator.getStream({
		  date_format: 'YYYY-MM-DD',
		  filename: logDirectory + '/access-%DATE%.log',
		  frecuency: 'daily',
		  verbose: false
	  });

	  app.use(morgan('common', {stream: accessLogStream}));
  }
  
  // Compress the response data using gzip/deflate
  app.use(compress());

  // Use the 'body-parser' middleware functions
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json({limit: '50mb'}));

  // Handle no valid JSON
  app.use(function(err, req, res, next) {
    res.status(400).send({
      success: false,
      message: 'JSON no válido',
      err: err
    });
  });

  // Use the 'method-override' middleware functions
  app.use(methodOverride());

  // Configure the app to handle CORS requests
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers',
      'X-Requested-With, Content-Type, Authorization');

    next();
  });

  // Load the signature (jwt)
  app.set('secret', config.secret);

  // Set the application view engine and 'views' folder
  app.set('views', __dirname + '/../app/views');
  app.set('view engine', 'ejs');

  // Load routing files
  require('../app/routes/affiliations.server.routes.js')(app);
  require('../app/routes/bloodTypes.server.routes.js')(app);
  require('../app/routes/countries.server.routes.js')(app);
  require('../app/routes/clinics.server.routes.js')(app);
  require('../app/routes/doctors.server.routes.js')(app);
  require('../app/routes/dosageVaccines.server.routes.js')(app);
  require('../app/routes/index.server.routes.js')(app);
  require('../app/routes/kinships.server.routes.js')(app);
  require('../app/routes/localities.server.routes.js')(app);
  require('../app/routes/municipalities.server.routes.js')(app);
  require('../app/routes/states.server.routes.js')(app);
  require('../app/routes/streetTypes.server.routes.js')(app);
  require('../app/routes/suburbTypes.server.routes.js')(app);
  require('../app/routes/tutors.server.routes.js')(app);
  require('../app/routes/users.server.routes.js')(app);
  require('../app/routes/vaccines.server.routes.js')(app);
  require('../app/routes/vaccinesControls.server.routes.js')(app);

  require('../app/routes/origins.server.routes.js')(app);
  require('../app/routes/catalogs.server.routes.js')(app);
  require('../app/routes/abouts.server.routes.js')(app);
  require('../app/routes/messagesapps.server.routes.js')(app);
  require('../app/routes/logcatalogs.server.routes.js')(app);
  require('../app/routes/catalogversions.server.routes.js')(app);
  require('../app/routes/binnacleusers.server.routes.js')(app);
  require('../app/routes/colorindicators.server.routes.js')(app);
  require('../app/routes/applicationages.server.routes.js')(app);
  require('../app/routes/patients.server.routes.js')(app);
  require('../app/routes/administrationroutes.server.routes.js')(app);
  require('../app/routes/direcciones.server.routers.js')(app);
  require('../app/routes/relresponsablecontacto.server.routes.js')(app);
  require('../app/routes/telefonos.server.routes.js')(app);
  // Configure static file serving
app.use(express.static(__dirname + '/../public'));

  return app;
};
