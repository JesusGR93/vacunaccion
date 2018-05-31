
// Use 'strict' JavaScript mode
'use strict';

// Set the 'development' enviroment configuration object
module.exports = {
  aes_iv: 'passwordpassword',
  aes_key: 'passwordpassword',
  cevEndpoint: 'http://13.85.13.249/cev/service/searchpatient',
  //db: 'mongodb://praxisdb:LMsXc2mfABB0@localhost:27017/vacunaccion',
 //db: 'mongodb://praxisdb:LMsXc2mfABB0@10.3.2.4:27017/vacunaccion',
 db: 'mongodb://praxisdb:LMsXc2mfABB0@localhost:27017/vacunaccion-cev',
  secret: 'secret_key',
  smtp: 'smtps://contacto%40protegelos.net:PlazaCarso2017@smtp.gmail.com',
  tokenExpirationTime: 6000
};


