
angular.module('tools').service('curp', [
  function() {

    /**
    * Elimina los acentos, eñes y diéresis que pudiera tener el nombre.
    * @param {string} str - String con el nombre o los apellidos.
    */
    function normalizeString(str) {
      var chars_1, chars_2, result;
      chars_1  = [ 'Ã', 'À', 'Á', 'Ä', 'Â', 'È', 'É', 'Ë', 'Ê', 'Ì', 'Í', 'Ï', 'Î',
               'Ò', 'Ó', 'Ö', 'Ô', 'Ù', 'Ú', 'Ü', 'Û', 'ã', 'à', 'á', 'ä', 'â',
               'è', 'é', 'ë', 'ê', 'ì', 'í', 'ï', 'î', 'ò', 'ó', 'ö', 'ô', 'ù',
               'ú', 'ü', 'û', 'Ç', 'ç' ];
      
      chars_2 = [ 'A', 'A', 'A', 'A', 'A', 'E', 'E', 'E', 'E', 'I', 'I', 'I', 'I',
               'O', 'O', 'O', 'O', 'U', 'U', 'U', 'U', 'a', 'a', 'a', 'a', 'a',
               'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'o', 'o', 'o', 'o', 'u',
               'u', 'u', 'u', 'c', 'c' ];

      str = str.toUpperCase().trim()
      str = str.split('');

      result = str.map(function (char) {
        var pos = chars_1.indexOf(char);
        return (pos > -1) ? chars_2[pos] : char;
      });

      return result.join('');
    }

    /**
    * Elimina proposiciones, contracciones o conjunciones.
    * @param {string} str - String que representa apellido.
    */
    function cleanString(str) {
      str = normalizeString(str)

      var compounds = [ /\bDA\b/, /\bDAS\b/, /\bDE\b/, /\bDEL\b/, /\bDER\b/, /\bDI\b/,
          /\bDIE\b/, /\bDD\b/, /\bEL\b/, /\bLA\b/, /\bLOS\b/, /\bLAS\b/, /\bLE\b/,
          /\bLES\b/, /\bMAC\b/, /\bMC\b/, /\bVAN\b/, /\bVON\b/, /\bY\b/ ];

      compounds.forEach(function (compound) {
        if (compound.test(str)) {
          str = str.replace(compound, '');
        }
      });

      return str;
    }

    /**
    * Obtiene la letra inicial del apellido paterno.
    * Si la letra es una Ñ la sustituye por X.
    * @param {string} surname - String que representa apellido.
    */
    function getFirstSurnameLetter(surname) {
      var FirtsSurnameLetter;

      if (!surname || surname === "") {
        FirtsSurnameLetter = 'X';
      } else {
        FirtsSurnameLetter = surname.substring(0, 1);
        FirtsSurnameLetter = FirtsSurnameLetter === 'Ñ' ? 'X' : FirtsSurnameLetter;
      }
      
      return FirtsSurnameLetter;
    }

    /**
    * Obtiene la letra vocal del apellido paterno a partir del segundo caracter. * Si no existe la vocal ingresa X.
    * @param {string} surname - String que representa apellido.
    */
    function getFirstSurnameVowel(surname) {
      var firstVowel = surname.substring(1).replace(/[BCDFGHJKLMNÑPQRSTVWXYZ]/g, '').substring(0, 1);
      firstVowel = (firstVowel === '') ? 'X' : firstVowel;
      return firstVowel;
    }

    /**
    * Estrae la inicial del primer nombre.
    * Si tiene nombres comunes obtine la inicial del segundo nombre.
    * @param {string} names - String que representa los nombres.
    */
    function getFirstNameLetter(names) {
      var names, isCommonName;
      var commons = [ 'MARIA', 'MA', 'MA.', 'JOSE', 'J', 'J.' ];

      names = names.split(/\s+/);
      isCommonName = (names.length > 1 && commons.indexOf(names[0]) > -1);

      if (isCommonName) {
        return names[1].substring(0, 1);
      } 
      else {
        return names[0].substring(0, 1);
      }
    }

    /**
    * Filtra palabras altisonantes en los primeros 4 caracteres del CURP
    * @param {string} str - Los primeros 4 caracteres del CURP
    */
    function filterBadWords(str) {
      var inconvenientes = [ 'BACA', 'LOCO', 'BUEI', 'BUEY', 'MAME', 'CACA', 'MAMO',
        'CACO', 'MEAR', 'CAGA', 'MEAS', 'CAGO', 'MEON', 'CAKA', 'MIAR', 'CAKO', 'MION',
        'COGE', 'MOCO', 'COGI', 'MOKO', 'COJA', 'MULA', 'COJE', 'MULO', 'COJI', 'NACA',
        'COJO', 'NACO', 'COLA', 'PEDA', 'CULO', 'PEDO', 'FALO', 'PENE', 'FETO', 'PIPI',
        'GETA', 'PITO', 'GUEI', 'POPO', 'GUEY', 'PUTA', 'JETA', 'PUTO', 'JOTO', 'QULO',
        'KACA', 'RATA', 'KACO', 'ROBA', 'KAGA', 'ROBE', 'KAGO', 'ROBO', 'KAKA', 'RUIN',
        'KAKO', 'SENO', 'KOGE', 'TETA', 'KOGI', 'VACA', 'KOJA', 'VAGA', 'KOJE', 'VAGO',
        'KOJI', 'VAKA', 'KOJO', 'VUEI', 'KOLA', 'VUEY', 'KULO', 'WUEI', 'LILO', 'WUEY',
        'LOCA' ];

      if (inconvenientes.indexOf(str) > -1) {
        str = str.replace(/^(\w)\w/, '$1X');
      }

      return str;
    }

    /**
    * Estrae los seis números de la fecha de nacimiento.
    * @param {string} birthdate - String que representa fecha de nacimiento con formato dd/mm/yyyy.
    */
    function getBirthdate(birthdate) {
      birthdate = birthdate.split('/');
      birthdate[0] = birthdate[0].substring(2,4);
      return birthdate.join('');
    }

    /**
    * Obtiene primer letra del sexo.
    * @param {string} gender - String con valor de MASCULINO ó FEMENINO.
    */
    function getFirstGenderLetter(gender) {
      var firstLetter = gender.trim().toUpperCase().substring(0, 1);

      return firstLetter;
    }

    /**
    * Obtiene siguente consonante después del primer caracter del string.
    * Si no hay una consonante devuelve X.
    * @param {string} name - String del cual se va a sacar la primer consonante.
    */
    function getNextConsonant(name) {
      var isCommonName;
      var commons = [ 'MARIA', 'MA', 'MA.', 'JOSE', 'J', 'J.' ];

      name = name.split(/\s+/);
      isCommonName = (name.length > 1 && commons.indexOf(name[0]) > -1);

      if (isCommonName) {
        name = name[1];
      } 
      else {
        name = name[0];
      }

      var nextConsonant = name.substring(1).replace(/[AEIOU]/ig, '').substring(0, 1);
      return (nextConsonant === '' || nextConsonant === 'Ñ') ? 'X' : nextConsonant;
    }


    /**
    * Agdd the verification digit to the curp.
    * @param {string} name - String with the 17 curp digits.
    */
    function addVerifyDigit(curp_str) {
      var curp, caracteres, numericCurp, sum, digito;

      caracteres  = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E',
        'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S',
        'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
      ];

      // Convierte el curp a un arreglo de números, usando la posición de cada
      // carácter, dentro del arreglo `caracteres`.
      numericCurp = curp.map(function (caracter) {
        return caracteres.indexOf(caracter);
      });

      sum = numericCurp.reduce(function (prev, valor, indice) {
        return prev + (valor * (18 - indice));
      }, 0);

      digito = (10 - (sum % 10));

      if (digito === 10) {
        digito = 0;
      }

      return curp_str + digito;
    }

    this.generate = function(param) {
    /**
      var curp = curp.generate({
        nombre            : 'María del Rosario',
        apellido_paterno  : 'Gomez',
        apellido_materno  : 'Juárez',
        sexo              : 'MASCULINO',
        estado            : 'DF',
        fecha_nacimiento  : 01/12/1988
      });
    */
      var curp = [];

      param.first_name     = cleanString(param.first_name);
      param.father_surname = cleanString(param.father_surname);
      param.mother_surname = cleanString(param.mother_surname);


      var name_chars = [
        getFirstSurnameLetter(param.father_surname),
        getFirstSurnameVowel(param.father_surname),
        getFirstSurnameLetter(param.mother_surname),
        getFirstNameLetter(param.first_name)
      ].join('');

      name_chars = filterBadWords(name_chars)

      curp = [
        name_chars, 
        getBirthdate(param.birthdate),
        getFirstGenderLetter(param.gender),
        param.state_code.trim().toUpperCase(),
        getNextConsonant(param.father_surname),
        getNextConsonant(param.mother_surname),
        getNextConsonant(param.first_name),
        // param.homonimia || ( parseInt(param.birthdate.substring(6), 10) > 1999 ? 'A' : 0 )
      ].join('');

      return curp;
    };
  }

]);
