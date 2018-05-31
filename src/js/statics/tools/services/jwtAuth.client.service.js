angular.module('tools').service('jwtAuth', [  '$base64', 'AES_IV', 'AES_KEY',
  function($base64, AES_IV, AES_KEY) {
    var _this = this;

    _this.saveToken = function(token){
      window.localStorage.jwtToken = token;
      //console.log("New token: "+window.localStorage.jwtToken);
    };
    _this.getToken = function() {
      // console.log("Retrive token: "+window.localStorage.jwtToken);
      return window.localStorage.jwtToken;
    };
    _this.logout = function() {
      window.localStorage.removeItem('jwtToken');
      window.localStorage.clear();
    };
    _this.isAuthed = function() {
      var token = _this.getToken();
      if(token) {
        var params = _this.parseJwt(token);
        // params.exp is no defined
        // params.isAuthed = Math.round(new Date().getTime() / 1000) <= params.exp;
        params.isAuthed = true;
        return params;
      } else {
        return false;
      }
    };
    _this.parseJwt = function(token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(window.atob(base64));
    };
    _this.encode = function(pass) {
      var cipher = forge.cipher.createCipher('AES-CBC', AES_KEY);
      cipher.start({iv: AES_IV});
      cipher.update(forge.util.createBuffer(pass));
      cipher.finish();
      return $base64.encode(cipher.output.data);
    };
  }

]);
