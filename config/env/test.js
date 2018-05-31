
// Use 'strict' JavaScript mode
'use strict';

// Set the 'development' enviroment configuration object
module.exports = {
  aes_iv: 'passwordpassword',
  aes_key: 'passwordpassword',
  cevEndpoint: 'http://www.siivac.net/cev_2/service/searchpatient',
  //db: 'mongodb://localhost/cev-protegelos',
 db: 'mongodb://praxisdb:LMsXc2mfABB0@10.1.0.5:27017/cev-protegelos',
 //db:'mongodb://praxisdb:LMsXc2mfABB0@13.66.27.226:27017/cev-protegelos',
  secret: 'secret_key',
  smtp: 'smtps://contacto%40protegelos.net:PlazaCarso2017@smtp.gmail.com',
  tokenExpirationTime:6000,
  url: 'http://10.1.0.5/cev-protegelos'
};

