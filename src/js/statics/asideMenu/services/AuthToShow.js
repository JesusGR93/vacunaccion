angular.module('asideMenu').service('AuthToShow', [
  'jwtAuth',
  function(jwtAuth) {

    var _this = this;

    _this.isAuthed = function(path){
      _this.loggedUser = jwtAuth.isAuthed();

      // console.log(_this.loggedUser.role);

      if (_this.loggedUser.role=="tutor") {
        if (path == "/admins" || path == "/admins/create") {
          return false;
        }
        if (path == "/doctors" || path == "/doctors/create") {
          return false;
        }
        if (path == "/tutors" || path == "/tutors/create") {
          return false;
        }
        if (path == "/clinics" || path == "/clinics/create") {
          return false;
        }
      }

      if (_this.loggedUser.role=="doctor") {
        if (path == "/admins" || path == "/admins/create") {
          return false;
        }
        if (path == "/doctors" || path == "/doctors/create") {
          return false;
        }
      }

      return true;
    };
  }
]);
