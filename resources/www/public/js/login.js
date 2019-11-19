'use strict';

var submitErrorObj, emailObj, passObj, emailReportObj, passReportObj, sendObj;

function init() {
  submitErrorObj = document.createTextNode('');
  document.getElementById('login_message').appendChild(submitErrorObj);

  emailReportObj = document.createTextNode('');
  document.getElementById('email_report').appendChild(emailReportObj);

  passReportObj = document.createTextNode('');
  document.getElementById('password_report').appendChild(passReportObj);

  emailObj = initFieldWithError('email', emailReportObj);
  passObj = initFieldWithError('password', passReportObj);

  sendObj = document.getElementById('send');
}

function initFieldWithError(id, reportObj) {
  var element = document.getElementById(id);
  element.addEventListener('focus', function(evt) { clearValidation(reportObj); });
  return element;
}

function submitLogin() {
  InputHelper.clearValidator();
  clearErrors();
  send.focus();

  var params = {
    email:    InputHelper.validate(emailObj, {required: true, length: [6, 256], op: 'email'}, onValidationError.bind(emailReportObj)),
    password: InputHelper.validate(passObj, {required: true, length: [1, 40], op: 'spaces'}, onValidationError.bind(passReportObj))
  }

  if (InputHelper.validationErrors()) {
    return false;
  }

  HttpClient.sendRequest('api/session', 'POST', params, processLoginResponse, {disableAuth: true});
  return false;
}

function processLoginResponse(status, statusText, response) {
  if (status == 200) {
    window.location.href = 'index';
  } else if (status == 401) {
    submitErrorObj.nodeValue = 'Usuario o contraseña incorrectos';
  } else {
    submitErrorObj.nodeValue = 'Lo sentimos, se ha producido un error, intenetalo mas tarde';
  }
}

function onValidationError(element, error) {
  this.nodeValue = error;
}

function clearErrors() {
  submitErrorObj.nodeValue = '';
  emailReportObj.nodeValue = '';
  passReportObj.nodeValue = '';
}

function clearValidation(textObj) {
  textObj.nodeValue = '';
}
