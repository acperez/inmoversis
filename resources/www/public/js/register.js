'use strict';

var emailObj, passMainObj, passCheckObj, nameObj, submitErrorObj, sendObj;
var emailReportObj, passMainReportObj, passMainReportTextObj, passCheckReportObj, nameReportObj;

function init() {
  submitErrorObj = document.createTextNode('');
  document.getElementById('register_message').appendChild(submitErrorObj);

  emailReportObj = document.createTextNode('');
  document.getElementById('email_report').appendChild(emailReportObj);
  passMainReportTextObj = document.createTextNode('');
  passMainReportObj = document.getElementById('password_main_report')
  passMainReportObj.appendChild(passMainReportTextObj);
  passCheckReportObj = document.createTextNode('');
  document.getElementById('password_check_report').appendChild(passCheckReportObj);
  nameReportObj = document.createTextNode('');
  document.getElementById('name_report').appendChild(nameReportObj);

  emailObj = initFieldWithError('email', emailReportObj);
  passMainObj = initPasswordField('password_main', passMainReportObj, passMainReportTextObj);
  passCheckObj = initFieldWithError('password_check', passCheckReportObj);
  nameObj = initFieldWithError('name', nameReportObj);

  sendObj = document.getElementById('send');
}

function initFieldWithError(id, reportObj) {
  var element = document.getElementById(id);
  element.addEventListener('focus', function(evt) { clearValidation(reportObj); });
  return element;
}

function initPasswordField(id, reportObj, reportTextObj) {
  var element = initFieldWithError(id, reportObj);
  element.addEventListener('keyup', function(evt) {
    InputHelper.check_passwd_safety(this.value, reportObj, reportTextObj); });
  return element;
}

function submitRegister() {
  InputHelper.clearValidator();
  clearErrors();
  send.focus();

  var params = {
    email:            InputHelper.validate(emailObj, {required: true, length: [6, 256], op: 'email'}, onValidationError.bind(emailReportObj)),
    password:         InputHelper.validate(passMainObj, {required: true, length: [1, 40], op: 'spaces'}, onValidationError.bind(passMainReportTextObj)),
    password_confirm: InputHelper.checkEquals(passCheckObj, passMainObj, passCheckReportObj),
    name:             InputHelper.validate(nameObj, {required: true, length: [2, 256]}, onValidationError.bind(nameReportObj))
  }

  if (InputHelper.validationErrors()) {
    return false;
  }

  delete params.password_confirm;

  HttpClient.sendRequest('api/user', 'POST', params, processRegisterReponse);
  return false;
}

function processRegisterReponse(status, statusText, response) {
  if (status == 200) {
    window.location.href = 'welcome';
  } else if (status == 409) {
    // User already exists
    reportSubmitError("El usuario con correo '" + response.id + "' ya existe");
  } else if (status == 422) {
    // Invalid or missing params
    reportSubmitError('Los datos que has introducido no son válidos, rervisalos y vuelve a intentarlo');
  } else {
    reportSubmitError('Lo sentimos, se ha producido un error, intenetalo mas tarde');
  }
}

function reportSubmitError(message) {
  submitErrorObj.nodeValue = message;
}

function clearErrors() {
  submitErrorObj.nodeValue = '';
  emailReportObj.nodeValue = '';
  passMainReportTextObj.nodeValue = '';
  passCheckReportObj.nodeValue = '';
  nameReportObj.nodeValue = '';
}

function onValidationError(element, error) {
  this.nodeValue = error;
}

function clearValidation(textObj) {
  textObj.nodeValue = '';
}
