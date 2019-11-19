'use strict';

var currentTab = null;

var tabs = [];

var user = null;

var statusMsgObj, statusBtnObj;

var idLabelObj, contactLabelObj, addressLabelObj, companyDataObj, userTypeObj;

var nameObj, lastNameObj, nationalityObj;
var nifObj, phoneLocationObj, phoneObj, addressObj, postalCodeObj, cityObj, regionObj;
var countryObj;

var companyNameObj, cifObj, companyAddressObj, companyPostalCodeObj, companyCityObj;
var companyRegionObj, companyCountryObj; 

var nameReportObj, lastNameReportObj, nifReportObj;
var phoneReportObj, addressReportObj, postalCodeReportObj;
var cityReportObj, regionReportObj;

var companyNameReportObj, cifReportObj, companyAddressReportObj;
var companyPostalCodeReportObj, companyCityReportObj, companyRegionReportObj;

var updateBtnObj, passBtnObj, passCancelBtnObj, passSendBtnObj, passViewObj, userViewObj, passErrorObj;
var passMainReportTextObj, passMainReportObj, passCheckReportObj, passMainObj, passCheckObj;
var updateErrorObj;

var nifLabelObj, nifBtnObj, nifPathObj, nifErrorObj, nifUploadObj;
var ppDocObj, ppLabelObj, ppBtnObj, ppPathObj, ppErrorObj, ppUploadObj;
var cyDoc1Obj, cyDoc1BtnObj, cyDoc1PathObj, cyDoc1ErrorObj, cyDoc1UploadObj;
var cyDoc2Obj, cyDoc2BtnObj, cyDoc2PathObj, cyDoc2ErrorObj, cyDoc2UploadObj;
var ibanObj, ibanBtnObj, ibanPathObj, ibanErrorObj, ibanUploadObj;
var sendDocsBtnObj;

function init() {
  prepareCountrySelect();
  initElements();

  currentTab = 0;
  addTab('tab-status', 'tab-status-content', function(){});
  addTab('tab-data', 'tab-data-content', function(){});
  addTab('tab-documents', 'tab-documents-content', function(){});
  addTab('tab-wallet', 'tab-wallet-content', function(){});
  addTab('tab-investments', 'tab-investments-content', function(){});

  User.init(onUserLoaded);
}

function addTab(tabId, panelId, action) {
  var tabObj = document.getElementById(tabId);
  var panelObj = document.getElementById(panelId);
  var index = tabs.length;
  tabObj.addEventListener('click', function(evt) { onTabClick(index); });
  tabs.push({ tab: tabObj,
              panel: panelObj,
              action: action });
}

function initElements() {
  statusMsgObj = document.createTextNode('');
  document.getElementById('status-message').appendChild(statusMsgObj);
  statusBtnObj = initActionClick('status-refresh', reloadUser);
  
  userTypeObj = document.createTextNode('');
  document.getElementById('user-type').appendChild(userTypeObj);

  idLabelObj = document.createTextNode('');
  document.getElementById('id-label').appendChild(idLabelObj);
  contactLabelObj = document.createTextNode('');
  document.getElementById('contact-label').appendChild(contactLabelObj);
  addressLabelObj = document.createTextNode('');
  document.getElementById('address-label').appendChild(addressLabelObj);
  companyDataObj = document.getElementById('company-data');

  nameReportObj = document.createTextNode('');
  document.getElementById('name_report').appendChild(nameReportObj);
  lastNameReportObj = document.createTextNode('');
  document.getElementById('lastname_report').appendChild(lastNameReportObj);
  nifReportObj = document.createTextNode('');
  document.getElementById('nif_report').appendChild(nifReportObj);
  phoneReportObj = document.createTextNode('');
  document.getElementById('phone_report').appendChild(phoneReportObj);
  addressReportObj = document.createTextNode('');
  document.getElementById('address_report').appendChild(addressReportObj);
  postalCodeReportObj = document.createTextNode('');
  document.getElementById('postal_code_report').appendChild(postalCodeReportObj);
  cityReportObj = document.createTextNode('');
  document.getElementById('city_report').appendChild(cityReportObj);
  regionReportObj = document.createTextNode('');
  document.getElementById('region_report').appendChild(regionReportObj);

  companyNameReportObj = document.createTextNode('');
  document.getElementById('company_name_report').appendChild(companyNameReportObj);
  cifReportObj = document.createTextNode('');
  document.getElementById('cif_report').appendChild(cifReportObj);
  companyAddressReportObj = document.createTextNode('');
  document.getElementById('company_address_report').appendChild(companyAddressReportObj);
  companyPostalCodeReportObj = document.createTextNode('');
  document.getElementById('company_postal_code_report').appendChild(companyPostalCodeReportObj);
  companyCityReportObj = document.createTextNode('');
  document.getElementById('company_city_report').appendChild(companyCityReportObj);
  companyRegionReportObj = document.createTextNode('');
  document.getElementById('company_region_report').appendChild(companyRegionReportObj);

  nameObj = initFieldWithError('name', nameReportObj);
  lastNameObj = initFieldWithError('lastname', lastNameReportObj);
  nationalityObj = document.getElementById('nationality');
  nifObj = initFieldWithError('nif', nifReportObj);
  phoneObj = initValidatedNumberField('phone', phoneReportObj);
  addressObj = initFieldWithError('address', addressReportObj);
  postalCodeObj = initFieldWithError('postal_code', postalCodeReportObj);
  cityObj = initFieldWithError('city', cityReportObj);
  regionObj = initFieldWithError('region', regionReportObj);
  countryObj = document.getElementById('country');
  phoneLocationObj = document.getElementById('phoneLocation');
  phoneLocationObj.addEventListener('change', function(evt) { clearValidationField(phoneReportObj); })

  companyNameObj = initFieldWithError('company_name', companyNameReportObj);
  cifObj = initFieldWithError('cif', cifReportObj);
  companyAddressObj = initFieldWithError('company_address', companyAddressReportObj);
  companyPostalCodeObj = initFieldWithError('company_postal_code', companyPostalCodeReportObj);
  companyCityObj = initFieldWithError('company_city', companyCityReportObj);
  companyRegionObj = initFieldWithError('company_region', companyRegionReportObj);
  companyCountryObj = document.getElementById('company-country');

  updateBtnObj = initActionClick('user-data-update-btn', updateUser);
  passBtnObj = initActionClick('user-password-update-btn', showPassView);
  passSendBtnObj = initActionClick('user-pass-form-send', updatePass);
  passCancelBtnObj = initActionClick('user-pass-form-cancel', hidePassView);
  passViewObj = document.getElementById('edit-user-password-form');
  userViewObj = document.getElementById('user-data');

  passMainReportTextObj = document.createTextNode('');
  passMainReportObj = document.getElementById('user-pass_report')
  passMainReportObj.appendChild(passMainReportTextObj);
  passCheckReportObj = document.createTextNode('');
  document.getElementById('user-pass-check_report').appendChild(passCheckReportObj);
  passMainObj = initPasswordField('user-pass', passMainReportObj, passMainReportTextObj);
  passCheckObj = initFieldWithError('user-pass-check', passCheckReportObj);

  passErrorObj = document.createTextNode('');
  document.getElementById('update-pass-error').appendChild(passErrorObj);

  updateErrorObj = document.createTextNode('');
  document.getElementById('update-user-error').appendChild(updateErrorObj);

  nifLabelObj = document.createTextNode('');
  document.getElementById('nif_label').appendChild(nifLabelObj);
  nifBtnObj = document.getElementById('nif_button');
  nifPathObj = document.createTextNode('');
  document.getElementById('nif_path').appendChild(nifPathObj);
  nifErrorObj = document.createTextNode('');
  document.getElementById('nif_error').appendChild(nifErrorObj);
  nifUploadObj = document.getElementById('nif_upload');
  initUploadControl(nifBtnObj, nifPathObj, nifErrorObj, nifUploadObj);

  ppDocObj = document.getElementById('pp_doc');
  ppLabelObj = document.createTextNode('');
  document.getElementById('pp_label').appendChild(ppLabelObj);
  ppBtnObj = document.getElementById('pp_button');
  ppPathObj = document.createTextNode(' ');
  document.getElementById('pp_path').appendChild(ppPathObj);
  ppErrorObj = document.createTextNode(' ');
  document.getElementById('pp_error').appendChild(ppErrorObj);
  ppUploadObj = document.getElementById('pp_upload');
  initUploadControl(ppBtnObj, ppPathObj, ppErrorObj, ppUploadObj);

  cyDoc1Obj = document.getElementById('cy_doc1');
  cyDoc1BtnObj = document.getElementById('cy_doc1_button');
  cyDoc1PathObj = document.createTextNode(' ');
  document.getElementById('cy_doc1_path').appendChild(cyDoc1PathObj);
  cyDoc1ErrorObj = document.createTextNode(' ');
  document.getElementById('cy_doc1_error').appendChild(cyDoc1ErrorObj);
  cyDoc1UploadObj = document.getElementById('cy_doc1_upload');
  initUploadControl(cyDoc1BtnObj, cyDoc1PathObj, cyDoc1ErrorObj, cyDoc1UploadObj);

  cyDoc2Obj = document.getElementById('cy_doc2');
  cyDoc2BtnObj = document.getElementById('cy_doc2_button');
  cyDoc2PathObj = document.createTextNode(' ');
  document.getElementById('cy_doc2_path').appendChild(cyDoc2PathObj);
  cyDoc2ErrorObj = document.createTextNode(' ');
  document.getElementById('cy_doc2_error').appendChild(cyDoc2ErrorObj);
  cyDoc2UploadObj = document.getElementById('cy_doc2_upload');
  initUploadControl(cyDoc2BtnObj, cyDoc2PathObj, cyDoc2ErrorObj, cyDoc2UploadObj);

  ibanObj = document.getElementById('iban_doc');
  ibanBtnObj = document.getElementById('iban_button');
  ibanPathObj = document.createTextNode('');
  document.getElementById('iban_path').appendChild(ibanPathObj);
  ibanErrorObj = document.createTextNode('');
  document.getElementById('iban_error').appendChild(ibanErrorObj);
  ibanUploadObj = document.getElementById('iban_upload');
  initUploadControl(ibanBtnObj, ibanPathObj, ibanErrorObj, ibanUploadObj);

  sendDocsBtnObj = initActionClick('send-docs-btn', onSendDocs);

}

function initActionClick(id, func) {
  var element = document.getElementById(id);
  element.addEventListener('click', function(evt) { func(evt); });
  return element;
}

function initFieldWithError(id, reportObj) {
  var element = document.getElementById(id);
  element.addEventListener('focus', function(evt) { clearValidationField(reportObj); });
  return element;
}

function initValidatedNumberField(id, reportObj) {
  var element = initFieldWithError(id, reportObj)
  element.addEventListener('keypress', function(evt) { filterNumber(evt); });
  return element;
}

function initPasswordField(id, reportObj, reportTextObj) {
  var element = initFieldWithError(id, reportObj);
  element.addEventListener('keyup', function(evt) {
    InputHelper.check_passwd_safety(this.value, reportObj, reportTextObj); });
  return element;
}

function initUploadControl(btnObj, filePathObj, fileErrorObj, uploadObj) {
  btnObj.addEventListener('click', function(evt) {
    uploadObj.click();
  })

  uploadObj.addEventListener('change', function(evt) {
    fileErrorObj.nodeValue = '';
    if (!uploadObj.files || !uploadObj.files[0]) {
      filePathObj.nodeValue = ' ';
      return;
    }

    var file = uploadObj.files[0];
    filePathObj.nodeValue = file.name;
  })
}

function filterNumber(event) {
  if (event.charCode != 46 && event.charCode < 48 || event.charCode > 57) {
    event.preventDefault();
  }
}

function clearValidationField(textObj) {
  textObj.nodeValue = '';
}

function prepareCountrySelect() {
  var phoneLocation = document.createElement("select");
  phoneLocation.classList.add("select");
  for (var country in countries) {
    var option = new Option(countries[country].n, country);
    phoneLocation.add(option);
    if (country == 'ES') option.setAttribute('selected', 'selected');
  }
  phoneLocation.id = 'phoneLocation';
  phoneLocation.style.display = 'inline-block'
  var phoneLocationDiv = document.getElementById('phone-location-div');
  phoneLocationDiv.appendChild(phoneLocation); 

  var nationalityList = document.createElement("select");
  nationalityList.classList.add("select");
  for (var country in countries) {    
    var option = new Option(countries[country].n, countries[country].c);
    nationalityList.add(option);
    if (country == 'ES') option.setAttribute('selected', 'selected');
  }
  nationalityList.id = 'nationality';
  nationalityList.style.display = 'inline-block'
  var nationalityDiv = document.getElementById('nationality-div');
  nationalityDiv.appendChild(nationalityList); 

  var countryList = nationalityList.cloneNode(true);
  countryList.id = 'country';
  countryList.style.display = 'inline-block'
  var countryDiv = document.getElementById('country-div');
  countryDiv.appendChild(countryList);

  var companyCountryList = nationalityList.cloneNode(true);
  companyCountryList.id = 'company-country';
  companyCountryList.style.display = 'inline-block'
  var companyCountryDiv = document.getElementById('company-country-div');
  companyCountryDiv.appendChild(companyCountryList);
}

function onTabClick(option) {
  if (option == currentTab) {
    return;
  }

  var current = tabs[currentTab];
  var next = tabs[option];

  current.tab.className = 'unselected';
  current.panel.style.display = 'none';

  next.tab.className = 'selected';
  next.panel.style.display = 'block';
  next.action();

  currentTab = option;
}

function disableTab(option) {
  var tab = tabs[option];
  tab.tab.className = 'disabled';
}

function disableTabs() {
  for (var i = 0; i < tabs.length; i++) {
    if (i == currentTab) {
      continue;
    }

    tabs[i].tab.className = 'disabled';
  }
}

function enableTabs() {
  for (var i = 0; i < tabs.length; i++) {
    if (i == currentTab) {
      continue;
    }

    tabs[i].tab.className = 'unselected';
  }
}

function reloadUser() {
  User.reload();
}

function onUserLoaded(data) {
  user = data;

  if (!user) {
    statusMsgObj.nodeValue = 'Se ha producido un error cargando tus datos personales';
    statusMsgObj.parentNode.classList.remove('text_fade_in');
    statusMsgObj.parentNode.offsetWidth; // Trick to restart animation by causing a reflow
    statusMsgObj.parentNode.classList.add('text_fade_in');

    statusBtnObj.style.display = 'inline-block';
    disableTabs();
    return;
  }
/*
  if (user.)'member' || userStatus == 'updating' ||
        userStatus == 'validating' || userStatus == 'rejected'
*/
  enableTabs();

  if (user.userStatus == 'validating') {
    disableTab(3);
    disableTab(4);
    disableFieldsValidating();
  }

  populateUser(user);

  statusBtnObj.style.display = 'none';

  if (user.userStatus == 'validating') {
    statusMsgObj.nodeValue = 'Tu documentación se está validando, hasta que no se verifique ' +
     'no podrás acceder a tu cartera ni a tus inversiones y solo podrás modificar algunos ' +
     'datos personales';
    return;
  }

  statusMsgObj.nodeValue = 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk';
}

function populateUser(user) {
  if (user.investorType != 'natural') {
    var company = user.company;
    companyNameObj.value = company.name;
    cifObj.value = company.cif;
    companyAddressObj.value = company.address;
    companyPostalCodeObj.value = company.postalCode;
    companyCityObj.value = company.city;
    companyRegionObj.value = company.region;
    companyCountryObj.value = company.country;

    userTypeObj.nodeValue = 'Acreditado';
    idLabelObj.nodeValue = 'Datos de identificación del apoderado';
    contactLabelObj.nodeValue = 'Datos de contacto del apoderado';
    addressLabelObj.nodeValue = 'Domicilio fiscal del apoderado';
    companyDataObj.style.display = 'block';

    cyDoc1Obj.style.display = 'list-item';
    cyDoc2Obj.style.display = 'list-item';
    
    if (user.nationalIdType == 'national') {
      nifLabelObj.nodeValue = 'DNI del representante legal (por las dos caras)';
      ppDocObj.style.display = 'none';
    } else {
      nifLabelObj.nodeValue = 'NIE del representante legal (por las dos caras)';
      ppLabelObj.nodeValue = 'Pasaporte del representante legal';
      ppDocObj.style.display = 'list-item';
    }

  } else {
    userTypeObj.nodeValue = 'Normal';
    idLabelObj.nodeValue = 'Datos de identificación';
    contactLabelObj.nodeValue = 'Datos de contacto';
    addressLabelObj.nodeValue = 'Domicilio fiscal';
    companyDataObj.style.display = 'none';

    cyDoc1Obj.style.display = 'none';
    cyDoc2Obj.style.display = 'none';

    if (user.nationalIdType == 'national') {
      nifLabelObj.nodeValue = 'DNI (por las dos caras)';
      ppDocObj.style.display = 'none';
    } else {
      nifLabelObj.nodeValue = 'NIE (por las dos caras)';
      ppLabelObj.nodeValue = 'Pasaporte';
      ppDocObj.style.display = 'list-item';
    }
  }

  nameObj.value = user.name;
  lastNameObj.value = user.lastName;
  nationalityObj.value = user.nationality;
  nifObj.value = user.nationalId;
  phoneObj.value = user.phoneNumber;
  phoneLocationObj.value = user.phoneLocation;
  addressObj.value = user.address;
  postalCodeObj.value = user.postalCode;
  cityObj.value = user.city;
  regionObj.value = user.region;
  country.value = user.country;
}

function disableFieldsValidating() {
  if (user.investorType != 'natural') {
    companyNameObj.disabled = true;
    cifObj.disabled = true;
    companyAddressObj.disabled = true;
    companyPostalCodeObj.disabled = true;
    companyCityObj.disabled = true;
    companyRegionObj.disabled = true;
    companyCountryObj.disabled = true;
  }

  nameObj.disabled = true;
  lastNameObj.disabled = true;
  nationalityObj.disabled  = true;
  nifObj.disabled = true;
}

function showPassView() {
  userViewObj.style.display = 'none';
  passViewObj.style.display = 'block';
}

function hidePassView() {
  userViewObj.style.display = 'block';
  passViewObj.style.display = 'none'; 
}

function onPassValidationError(element, error) {
  this.nodeValue = error;
}

function updatePass() {
  InputHelper.clearValidator();
  
  passErrorObj.nodeValue = '';
  passMainReportTextObj.nodeValue = '';
  passCheckReportObj.nodeValue = '';
  
  passSendBtnObj.focus();

  var params = {
    password:         InputHelper.validate(passMainObj, {required: true, length: [1, 40], op: 'spaces'}, onPassValidationError.bind(passMainReportTextObj)),
    password_confirm: InputHelper.checkEquals(passCheckObj, passMainObj, passCheckReportObj)
  }

  if (InputHelper.validationErrors()) {
    return false;
  }

  delete params.password_confirm;

  HttpClient.sendRequest('api/user/pass', 'PUT', params, processUpdatePass);
  return false;
}

function processUpdatePass(status, statusText, response) {
  if (status != 200) {
    passErrorObj.nodeValue = 'Se ha producido un error, vuelve a intentarlo';
    passErrorObj.parentNode.classList.remove('text_fade_in');
    passErrorObj.parentNode.offsetWidth; // Trick to restart animation by causing a reflow
    passErrorObj.parentNode.classList.add('text_fade_in');
    return;
  }

  hidePassView();
}

function updateUser() {
  if (user.userStatus == 'validating') {
    return updateUserValidating();
  }
}

function validatePhone(phone, country, phoneTextObj) {
  var showErr = function(msg) {
    InputHelper._errors = true;
    phoneTextObj.nodeValue = msg;
  }

  var number = phone.value;
  if (number.length == 0) {
    showErr('Campo obligatorio');
    return null;
  }

  var phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
  try{
    var phoneNumber = phoneUtil.parse(number, country.value);
  } catch (e) {
    showErr('Teléfono inválido');
    return null;
  }

  if (!phoneUtil.isValidNumber(phoneNumber)) {
    showErr('Teléfono inválido');
    return null;
  }

  return {
    number: phoneNumber.getNationalNumber().toString(),
    e164: phoneUtil.format(phoneNumber, libphonenumber.PhoneNumberFormat.E164)
  }
}

function onValidationError(element, error) {
  this.nodeValue = error;
}

function updateUserValidating() {
  clearValidation();
  InputHelper.clearValidator();

  var postValidator = 'postalCode'
  if (countryObj.value == 'ES') {
    postValidator = 'postalCodeEs'
  }

  var phone = validatePhone(phoneObj, phoneLocationObj, phoneReportObj);

  var params = {
    phoneNumber: phone.number,
    phoneLocation: phoneLocationObj.value,
    address: InputHelper.validate(addressObj, {required: true, length: [2, 256]}, onValidationError.bind(addressReportObj)),
    postalCode: InputHelper.validate(postalCodeObj, {required: true, op: postValidator}, onValidationError.bind(postalCodeReportObj)),
    city: InputHelper.validate(cityObj, {required: true, length: [1, 140]}, onValidationError.bind(cityReportObj)),
    region: InputHelper.validate(regionObj, {required: true, length: [1, 140]}, onValidationError.bind(regionReportObj)),
    country: countryObj.value
  }

  if (InputHelper.validationErrors()) {
    updateErrorObj.nodeValue = 'Hay errores en el formulario, revisalo.';
    return false;
  }

  for (var property in params) {
    if (params[property] == user[property]) {
      delete params[property];
    }
  }

  if (isEmpty(params)) {
    return false;
  }

  if (params.phoneNumber || params.phoneLocation) {
    params.phoneNumber = phone.e164;
    params.phoneLocation = phoneLocationObj.value;
  }

  HttpClient.sendRequest(
    'api/user/details',
    'PUT',
    params,
    processUserDataResponse,
    { loading: true, msg: 'Enviando datos' });

  return true;
}

function isEmpty(obj) {
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

function processUserDataResponse(status, statusText, response)  {
  if (status == 200) {
    user = response;
    populateUser(user);
  } else if (status == 422) {
    updateErrorObj.nodeValue = 'Algún dato del formulario no es válido.';
  } else {
    updateErrorObj.nodeValue = 'Se ha producido un error conectando con el servidor.';
  }
}

function clearValidation() {
  nameReportObj.nodeValue = '';
  lastNameReportObj.nodeValue = '';
  nifReportObj.nodeValue = '';
  phoneReportObj.nodeValue = '';
  addressReportObj.nodeValue = '';
  postalCodeReportObj.nodeValue = '';
  cityReportObj.nodeValue = '';
  regionReportObj.nodeValue = '';

  companyNameReportObj.nodeValue = '';
  cifReportObj.nodeValue = '';
  companyAddressReportObj.nodeValue = '';
  companyPostalCodeReportObj.nodeValue = '';
  companyCityReportObj.nodeValue = '';
  companyRegionReportObj.nodeValue = '';

  updateErrorObj.nodeValue = '';
}

function onSendDocs() {
  console.log('hola')

  var docs = {
    id: null,
    passport: null,
    companyTitle: null,
    companyProof: null
  };

  docs.id = getAttachment(nifUploadObj, nifErrorObj);  
  if (!docs.id) {
    console.log('Datos incorrectos, revisa el formulario');
    return false;
  }

  if (user.nationalIdType == 'foreign') {
    docs.passport = getAttachment(ppUploadObj, ppErrorObj);
    
    if (!docs.passport) {
      console.log('Datos incorrectos, revisa el formulario');
      return false;
    }
  }

  if (user.investorType == 'accredited') {
    docs.companyTitle = getAttachment(cyDoc1UploadObj, cyDoc1ErrorObj);
    docs.companyProof = getAttachment(cyDoc2UploadObj, cyDoc2ErrorObj);

    if (!docs.companyTitle || !docs.companyProof) {
      console.log('Datos incorrectos, revisa el formulario');
      return false;
    }
  }

  var data = new FormData();
  for (var name in docs) {
    if (docs[name]) {
      data.append(name, docs[name]);
    }
  }

  HttpClient.sendFormData(
    '/api/user/docs',
    'PUT',
    data,
    processUploadSubmitComplete,
    { loading: true, msg: 'Enviando documentos' });

  return false;
}

function getAttachment(uploadObj, reportObj) {
  if (!uploadObj.files || !uploadObj.files[0]) {
    reportObj.nodeValue = 'Archivo obligatorio';
    return null;
  }

  var file = uploadObj.files[0];
  if (!/(pdf|png|jpg|jpeg|bmp|gif)/.test(file.type)) {
    reportObj.nodeValue = 'Tipo de archivo no válido';
    return null;
  }

  if (file.size > 4 * 1024 * 1024) {
    reportObj.nodeValue = 'Archivo mayor de 4MB';
    return null;
  }

  return file;
}

function processUploadSubmitComplete(status, statusText, response) {
  if (status == 200) {
    console.log("Send ok");
  } else if (status == 422) {
    console.log('Algún dato del formulario no es válido.');
  } else {
    console.log('Se ha producido un error conectando con el servidor.');
  }
}
