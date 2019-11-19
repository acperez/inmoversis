'use strict';

var InputHelper = {
  _has_letter: new RegExp("[a-z]"),
  _has_caps: new RegExp("[A-Z]"),
  _has_numbers: new RegExp("[0-9]"),
  _has_symbols: new RegExp("\\W"),

  _errors: false,

  clearValidator: function clearValidator() {
    this._errors = false;
  },

  validationErrors: function validationErrors() {
    return this._errors;
  },

  check_passwd_safety: function check_passwd_safety(pwd, reportObj, reportTextObj) {
    var msg = "";
    var color = "#ff0000";
    var points = pwd.length;

    if (this._has_letter.test(pwd)) { points += 4; }
    if (this._has_caps.test(pwd)) { points += 4; }
    if (this._has_numbers.test(pwd)) { points += 4; }
    if (this._has_symbols.test(pwd)) { points += 4; }

    if ( points == 0 ) {
      reportTextObj.nodeValue = '';
      return;
    } else if ( points < 12 ) {
      msg = 'Contraseña insegura';
    } else if ( points < 16) {
      msg = 'Contraseña poco segura';
      color = '#ffaa00';
    } else if ( points < 24 ) {
      msg = 'Contraseña segura';
      color = '#0000ff';
    } else {
      msg = 'Contraseña muy segura';
      color = '#008800';
    }

    reportObj.style.color = color;
    reportTextObj.nodeValue = msg;
  },

  clear_message: function clear_message(element) {
    document.getElementById(element).innerText = '';
  },

  validateLoginForm: function validateLoginForm(params) {
    var valid = true;

    // Validate email
    valid &= this.check_email(params.email, 'email_verification');

    // Validate passwd
    valid &= !this.check_empty(params.password, 'passwd_report');

    return valid == 1;
  },

  validateBirthday: function validateBirthday(element, dayObj, monthObj, yearObj, onError) {
    var self = this;
    var failed = function (error_msg) {
      self._errors = true;
      onError(element, error_msg);
    }

    var day = dayObj.value;
    var month = monthObj.value;
    var year = yearObj.value;

    var _2d = /^(\d{2})$/;
    var _4d = /^(\d{4})$/;

    if (day.length == 0 || month.length == 0 || year.length == 0) {
      return failed('Campo necesario');
    }

    if (!_2d.test(day) || !_2d.test(month) || !_4d.test(year)) {
      return failed('Formato inv&aacute;lido');
    }

    var month = month - 1;
    var birthday = new Date(year, month, day);
    if (birthday.getDate() != day) {
      return failed('Dia inv&aacute;lido');
    }

    if (birthday.getMonth() != month) {
      return failed('Mes inv&aacute;lido');
    }

    if (birthday.getFullYear() != year) {
      return failed('Año inv&aacute;lido');
    }

    var adult = new Date();
    adult.setYear(adult.getYear() - 18);
    var dead = new Date();
    dead.setYear(dead.getYear() - 100);

    if (birthday > Date.now()) {
      return failed('Aún no has nacido?');
    } else if (birthday > adult.getTime()) {
      return failed('Eres demasiado joven');
    } else if (birthday < dead.getTime()) {
      return failed('abuelo!!');
    }

    return birthday.getTime();
  },

  validateById: function validateById(elementId, options, onError) {
    var element = document.getElementById(elementId);
    return this.validate(element, options, onError);
  },


  _actions: {
    required: {
      apply: function (value, required) {
        if (!value || !value.trim().length) {
          return new TypeError('Campo necesario');
        }

        return value;
      }
    },

    length: {
      apply: function(value, range) {
        if (value.length >= range[0] && value.length <= range[1]) {
          return value;
        }

        return new TypeError('Longitud de ' + range[0] + ' a ' + range[1]);
      }
    },

    op: {
      apply: function(value, validator) {
        return this._validators[validator].validate(value);
      },

      _validators: {
        email: {
          _email: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
          validate: function checkEmail(value) {
            if (this._email.test(value)) {
              return value;
            }
          
            return new TypeError('Dirección de email inválida');
          }
        },

        spaces: {
          validate: function checkSpaces(value) {
            if (/\s/.test(value)) {
              return new TypeError('No esta permitido usar espacios');
            }

            return value;
          }
        },

        number: {
          validate: function checkNumber(value) {
            var x = parseFloat(value);
            if (isNaN(value)) {
              return new TypeError('Campo numérico');
            }

            return Number(value); 
          }
        },

        integer: {
          validate: function checkInteger(value) {
            var x = parseFloat(value);
            if (isNaN(value) || (x | 0) !== x) {
              return new TypeError('Campo numérico entero');
            }

            return parseInt(value); 
          }
        },

        alphabeticNoSpaces: {
          _alphabetic: /^[a-zA-ZñÑ]+$/,
          validate: function(value) {
            if (this._alphabetic.test(value)) {
              return value;
            }

            return new TypeError('Solo letras sin espacios');
          }
        },

        alphabeticSpaces: {
          error_msg: 'Campo alphabetico',
          _alphabetic: /^[a-zA-ZñÑ]*$/,
          validate: function(value) {
            if (this._alphabetic.test(value)) {
              return value;
            }

            return new TypeError(this.error_msg);
          }
        },

        alphanumeric: {
          error_msg: 'Campo alphanumérico',
          _alphanumeric: /^[A-zÀ-ÿ\s\d]*$/,
          validate: function(value) {
            if (this._alphanumeric.test(value)) {
              return value;
            }

            return new TypeError(this.error_msg);
          }
        },

        text: {
          error_msg: 'Caracter no permitido',
          _text: /^[A-zÀ-ÿ\s\d-.]*$/,
          validate: function(value) {
            if (this._text.test(value)) {
              return value;
            }

            return new TypeError(this.error_msg);
          }
        },

        postalCodeEs: {
          error_msg: 'Código postal inválido',
          _postalCode: /^([1-9]{2}|[0-9][1-9]|[1-9][0-9])[0-9]{3}$/,
          validate: function checkPostalCode(value) {
            if (this._postalCode.test(value)) {
              return value;
            }

            return new TypeError(this.error_msg);
          }
        },

        postalCode: {
          error_msg: 'Código postal inválido',
          _postalCode: /^[A-zÀ-ÿ\s\d-.]*$/,
          validate: function checkPostalCode(value) {
            if (this._postalCode.test(value) && value.length < 10 && value.length > 2) {
              return value;
            }

            return new TypeError(this.error_msg);
          }
        },

        nif: {
          error_msg: 'NIF o NIE inválido',
          _nif: /^(\d{8})([A-Z])$/,
          _nifLetters: "TRWAGMYFPDXBNJZSQVHLCKE",
          _nie: /^[XYZ]\d{7,8}[A-Z]$/,
          validate: function checkNIF(value) {
            value = value.toUpperCase();
            var nif = value;

            if (this._nie.test(value)) {
              var nie_prefix = value.charAt(0);
              if (nie_prefix == 'X') {
                nie_prefix = 0;
              } else if (nie_prefix == 'Y') {
                nie_prefix = 1;
              } else if (nie_prefix == 'Z') {
                nie_prefix = 2;
              } else {
                return new TypeError(this.error_msg);
              }

              nif = nie_prefix + nif.substr(1);
            }

            if (!this._nif.test(nif)) {
              return new TypeError(this.error_msg);
            }

            if (nif.charAt(8) != this._nifLetters.charAt(parseInt(nif, 10) % 23)) {
              return new TypeError(this.error_msg);
            }

            return value;
          }
        },

        cif: {
          error_msg: 'CIF inválido',
          _cif1: /^[ABEH][0-9]{8}$/i,
          _cif2: /^[KPQS][0-9]{7}[A-J]$/i,
          _cif3: /^[CDFGJLMNRUVW][0-9]{7}[0-9A-J]$/i,
          validate: function checkCIF(value) {
            value = value.toUpperCase();
            if (!this._cif1.test(value) && !this._cif2.test(value) && !this._cif3.test(value)) {
              return new TypeError(this.error_msg);
            }

            var control = value.charAt(value.length - 1);
            var sum_A = 0;
            var sum_B = 0;
            for (var i = 1; i < 8; i++) {
              if (i % 2 == 0) sum_A += parseInt(value.charAt(i));
              else {
                var t = (value.charAt(i) * 2) + "";
                var p = 0;
                for (var j = 0; j < t.length; j++) {
                  p += parseInt(t.charAt(j));
                }
                sum_B += p;
              }
            }

            var sum_C = (sum_A + sum_B) + "";
            var sum_D = (10 - parseInt(sum_C.charAt(sum_C.length - 1))) % 10;
            var letters = "JABCDEFGHI";
            var result = false;
            if (control >= "0" && control <= "9") {
              result = (control == sum_D);
            } else {
              result = (control == letters.charAt(sum_D));
            }

            if (!result) {
              return new TypeError(this.error_msg);
            }

            return value;
          }
        }
      }
    }
  },

  validate: function validate(element, options, onError) {
    var value = element.value;

    for (var action in options) {
      value = this._actions[action].apply(value, options[action]);
      if (value instanceof TypeError) {
        if (action == 'required' && !options[action]) {
          return undefined;
        }

        this._errors = true;
        onError(element, value.message, action);
        return null;
      }
    }

    return value;
  },

  checkEquals: function checkEquals(pwd1Obj, pwd2Obj, errorObj) {
    if (pwd1Obj.value != pwd2Obj.value) {
      errorObj.nodeValue = 'La contraseña no coincide';
      this._errors = true;
      return;
    }

    return pwd1Obj.value;
  }
};
