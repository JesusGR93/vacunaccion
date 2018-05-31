angular.module('asideMenu').factory('AsideMenuArray',['$resource',
  function($resource){

    return [
      {
        selected:   false,
        view:       "",
        tag:        "MI PERFIL",
        ic:         "./img/ic_medico",
        path:       ""
      },
      {
        selected:   false,
        view:       "/index/views/index-admon-list.client.view.html",
        tag:        "ADMINISTRADORES",
        ic:         "./img/ic_tutor",
        path:       "/admins"
      },
      {
        selected:   false,
        view:       "",
        tag:        "ADMINISTRACIÓN DE MÉDICOS",
        ic:         "./img/ic_medico",
        path:       "/doctors"
      },
      {
        selected:   false,
        view:       "",
        tag:        "ADMINISTRACIÓN DE RESPONSABLES",
        ic:         "./img/ic_tutor",
        path:       "/tutors"
      },
      {
        selected:   false,
        view:       "",
        tag:        "ADMINISTRACIÓN DE PACIENTES",
        ic:         "./img/ic_menor",
        path:       "/patients"
      },
      {
        selected:   false,
        view:       "",
        tag:        "CENTROS DE SALUD",
        ic:         "./img/ic_detalle",
        path:       "/clinics"
      }
      /*,
      {
        selected:   false,
        view:       "",
        tag:        "Administración de vacunas",
        ic:         "./img/ic_editar",
        path:       "/vaccines"
      }*/
    ];
  }
]);
