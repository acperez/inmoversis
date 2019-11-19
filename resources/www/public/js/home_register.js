'use strict';

var currentTab = 0;
var naturalUser = true;
var user = null;

var tabs = [];

var invNaturalBtnObj, invLegalBtnObj, infoNaturalUserObj, infoLegalUserObj;

var nextBtnObj1, nextBtnObj2, prevBtnObj2, nextBtnObj3, prevBtnObj3, nextBtnObj4;
var prevBtnObj4, nextBtnObj5, prevBtnObj5, prevBtnObj6; 

var idLabelObj, contactLabelObj, addressLabelObj, companyDataObj;

var userTypeObj, nameObj, lastNameObj, nationalityObj;
var nifObj, phoneLocationObj, phoneObj, addressObj, postalCodeObj, cityObj, regionObj;
var countryObj;

var companyNameObj, cifObj, companyAddressObj, companyPostalCodeObj, companyCityObj;
var companyRegionObj, companyCountryObj; 

var nameReportObj, lastNameReportObj, nifReportObj;
var phoneReportObj, addressReportObj, postalCodeReportObj;
var cityReportObj, regionReportObj;

var companyNameReportObj, cifReportObj, companyAddressReportObj;
var companyPostalCodeReportObj, companyCityReportObj, companyRegionReportObj;

var registerSubmitObj, registerSubmitTextObj, uploadSubmitTextObj, uploadSubmitObj;

var nifLabelObj, nifBtnObj, nifPathObj, nifErrorObj, nifUploadObj;
var ppDocObj, ppLabelObj, ppBtnObj, ppPathObj, ppErrorObj, ppUploadObj;
var cyDoc1Obj, cyDoc1BtnObj, cyDoc1PathObj, cyDoc1ErrorObj, cyDoc1UploadObj;
var cyDoc2Obj, cyDoc2BtnObj, cyDoc2PathObj, cyDoc2ErrorObj, cyDoc2UploadObj;
var cyDoc3Obj, cyDoc3BtnObj, cyDoc3PathObj, cyDoc3ErrorObj, cyDoc3UploadObj;

function init() {
  initTabs();
  prepareCountrySelect();
  loadElements();
  User.init(onUserLoaded);
}

function fillFakeUserData() {
  lastNameObj.value = 'pepito';
  nifObj.value = '12345678z';
  phoneObj.value = '623456789';
  addressObj.value = 'Rue percebe 4';
  postalCodeObj.value = '12345';
  cityObj.value = 'mundo';
  regionObj.value = 'mundo';

  companyNameObj.value = 'Acme S.L.';
  cifObj.value = 'E04366258';
  companyAddressObj.value = 'Rue percebe 4';
  companyPostalCodeObj.value = '12345';
  companyCityObj.value = 'mundo';
  companyRegionObj.value = 'mundo';
}

function initTabs() {
  currentTab = 0;
  addTab('form_tab_1', 'step1', validateInfoStep);
  addTab('form_tab_2', 'step2', validateInvestorStep);
  addTab('form_tab_3', 'step3', validateUserData);
  addTab('form_tab_4', 'step4', validateDocs);
}

function addTab(tabId, panelId, validateFunc) {
  var tabObj = document.getElementById(tabId);
  var panelObj = document.getElementById(panelId);
  var index = tabs.length;
  tabs.push({ tab: tabObj,
              panel: panelObj,
              validate: validateFunc });
}

function onTabClick(option) {
  var index = option -1;
  if (index < 0) {
    index = 0;
  }

  if (index > tabs.length - 1) {
    index = tabs.length;
  }

  if (index == currentTab) {
    return;
  }

  var current = tabs[currentTab];
  var next = tabs[index];

  current.panel.style.display = 'none';
  current.tab.classList.remove('form_progress_select');

  next.panel.style.display = 'block';
  next.tab.firstElementChild.style.backgroundColor = '#1990EF';
  next.tab.classList.add('form_progress_select');

  currentTab = index;
}

function formValidation(option, async) {
  var valid = tabs[currentTab].validate();
  if (valid && !async) {
    onTabClick(option);
  }
}

function loadElements() {
  nextBtnObj1 = initActionClick('next_btn1', function(){ return formValidation(2, false); });
  nextBtnObj2 = initActionClick('next_btn2', function(){ return formValidation(3, false); });
  prevBtnObj2 = initActionClick('prev_btn2', function(){ return onTabClick(1); });
  nextBtnObj3 = initActionClick('next_btn3', function(){ return formValidation(4, true); });
  prevBtnObj3 = initActionClick('prev_btn3', function(){ clearDataErrors(); return onTabClick(2); });
  nextBtnObj4 = initActionClick('next_btn4', function(){ return formValidation(4, false); });
  prevBtnObj4 = initActionClick('prev_btn4', function(){ clearDocsErrors(); return onTabClick(3, false); });

  invNaturalBtnObj = initActionClick('inv_natural_btn', onNaturalInvClick);
  invLegalBtnObj = initActionClick('inv_legal_btn', onLegalInvClick);
  infoNaturalUserObj = document.getElementById('info_natural_user');
  infoLegalUserObj = document.getElementById('info_legal_user');

  idLabelObj = document.getElementById('id-label').childNodes[0];
  contactLabelObj = document.getElementById('contact-label').childNodes[0];
  addressLabelObj = document.getElementById('address-label').childNodes[0];
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

  userTypeObj = document.getElementById('user-type');
  userTypeObj.addEventListener('change', function(evt) { renderUserType(userTypeObj.value); })
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

  registerSubmitTextObj = document.createTextNode('');
  registerSubmitObj = document.getElementById('register_form_report');
  registerSubmitObj.appendChild(registerSubmitTextObj);

  uploadSubmitTextObj = document.createTextNode('');
  uploadSubmitObj = document.getElementById('register_docs_report');
  uploadSubmitObj.appendChild(uploadSubmitTextObj);

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

  cyDoc3Obj = document.getElementById('cy_doc3');
  cyDoc3BtnObj = document.getElementById('cy_doc3_button');
  cyDoc3PathObj = document.createTextNode(' ');
  document.getElementById('cy_doc3_path').appendChild(cyDoc3PathObj);
  cyDoc3ErrorObj = document.createTextNode(' ');
  document.getElementById('cy_doc3_error').appendChild(cyDoc3ErrorObj);
  cyDoc3UploadObj = document.getElementById('cy_doc3_upload');
  initUploadControl(cyDoc3BtnObj, cyDoc3PathObj, cyDoc3ErrorObj, cyDoc3UploadObj);
}

function initActionClick(id, func) {
  var element = document.getElementById(id);
  element.addEventListener('click', function(evt) { func(evt); });
  return element;
}

function initValidatedNumberField(id, reportObj) {
  var element = initFieldWithError(id, reportObj)
  element.addEventListener('keypress', function(evt) { filterNumber(evt); });
  return element;
}

function fillNumber(event, element, length) {
  var value = element.value;
  if (value.length != length) {
    value = (Array(length + 1).join("0") + value).slice(-length);
  }
  element.value = value;
}

function filterNumber(event) {
  if (event.charCode != 46 && event.charCode < 48 || event.charCode > 57) {
    event.preventDefault();
  }
}

function initFieldWithError(id, reportObj) {
  var element = document.getElementById(id);
  element.addEventListener('focus', function(evt) { clearValidationField(reportObj); });
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

function clearValidationField(element) {
  element.nodeValue = '';
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

  registerSubmitTextObj.nodeValue = '';
}

function onUserLoaded() {
  user = User.getData();

  if (user.userType == 'company') {
    userTypeObj.value = 'company';
    var company = user.company;
    companyNameObj.value = company.name;
    cifObj.value = company.cif;
    companyAddressObj.value = company.address;
    companyPostalCodeObj.value = company.postalCode;
    companyCityObj.value = company.city;
    companyRegionObj.value = company.region;
    if (company.country) {
      companyCountryObj.value = company.country;
    }
  }

  renderUserType(user.userType);

  if (user.investorType == 'accredited') {
    onLegalInvClick();
  } else {
    onNaturalInvClick();
  }

  nameObj.value = user.name;
  lastNameObj.value = user.lastName;
  if (user.nationality) {
    nationalityObj.value = user.nationality;
  }
  nifObj.value = user.nationalId;
  phoneObj.value = user.phoneNumber;
  phoneLocationObj.value = user.phoneLocation;
  addressObj.value = user.address;
  postalCodeObj.value = user.postalCode;
  cityObj.value = user.city;
  regionObj.value = user.region;
  if (user.country) {
    country.value = user.country;
  }

  renderDocsPanel();

  if (user.userStatus == 'identified') {
    onTabClick(4);
    return;
  }

  if (user.userStatus == 'guest') {
    tabs[0].panel.style.display = 'block';
    tabs[0].tab.classList.add('form_progress_select');
  }

  fillFakeUserData();
}

function renderUserType(userType) {
  if (userType != 'company') {
    idLabelObj.nodeValue = 'Datos de identificación';
    contactLabelObj.nodeValue = 'Datos de contacto';
    addressLabelObj.nodeValue = 'Domicilio fiscal';
    companyDataObj.style.display = 'none'; 
  } else {
    idLabelObj.nodeValue = 'Datos de identificación del apoderado';
    contactLabelObj.nodeValue = 'Datos de contacto del apoderado';
    addressLabelObj.nodeValue = 'Domicilio fiscal del apoderado';
    companyDataObj.style.display = 'block'; 
  }
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

function onNaturalInvClick() {
  if (naturalUser) {
    return;
  }

  infoNaturalUserObj.style.display = 'block';
  infoLegalUserObj.style.display = 'none';

  invNaturalBtnObj.classList.remove('unselected');
  invNaturalBtnObj.classList.add('inv-selected');
  invLegalBtnObj.classList.add('unselected');
  invLegalBtnObj.classList.remove('inv-selected');
  naturalUser = true;
}

function onLegalInvClick() {
  if (!naturalUser) {
    return;
  }

  infoNaturalUserObj.style.display = 'none';
  infoLegalUserObj.style.display = 'block';

  invNaturalBtnObj.classList.add('unselected');
  invNaturalBtnObj.classList.remove('inv-selected');
  invLegalBtnObj.classList.remove('unselected');
  invLegalBtnObj.classList.add('inv-selected');
  naturalUser = false;
}


function validateInfoStep() {
  return true;
}

function validateInvestorStep() {
  return true;
}

function onValidationError(element, error) {
  this.nodeValue = error;
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

  return phoneUtil.format(phoneNumber, libphonenumber.PhoneNumberFormat.E164);
}

function validateUserData() {
  clearValidation();
  InputHelper.clearValidator();

  var postValidator = 'postalCode'
  if (countryObj.value == 'ES') {
    postValidator = 'postalCodeEs'
  }

  var params = {
    name: InputHelper.validate(nameObj, {required: true, length: [2, 256]}, onValidationError.bind(nameReportObj)),
    lastName: InputHelper.validate(lastNameObj, {required: true, length: [2, 256]}, onValidationError.bind(lastNameReportObj)),
    nationality: nationalityObj.value,
    nationalId: InputHelper.validate(nifObj, {required: true, op: 'nif'}, onValidationError.bind(nifReportObj)),
    phoneNumber: validatePhone(phoneObj, phoneLocationObj, phoneReportObj),
    phoneLocation: phoneLocationObj.value,
    address: InputHelper.validate(addressObj, {required: true, length: [2, 256]}, onValidationError.bind(addressReportObj)),
    postalCode: InputHelper.validate(postalCodeObj, {required: true, op: postValidator}, onValidationError.bind(postalCodeReportObj)),
    city: InputHelper.validate(cityObj, {required: true, length: [1, 140]}, onValidationError.bind(cityReportObj)),
    region: InputHelper.validate(regionObj, {required: true, length: [1, 140]}, onValidationError.bind(regionReportObj)),
    country: countryObj.value,
    naturalUser: naturalUser,
    isCompany: userTypeObj.value == 'company',
    company: validateCompanyData(userTypeObj.value)
  }

  if (InputHelper.validationErrors()) {
    showSubmitError('Hay errores en el formulario, revisalo.');
    return false;
  }

  HttpClient.sendRequest(
    'api/user/details',
    'POST',
    params,
    processUserDataResponse,
    { loading: true, msg: 'Enviando datos' });

  return true;
}

function showSubmitError(msg) {
  registerSubmitTextObj.nodeValue = msg;
  registerSubmitObj.classList.remove('text_fade_in');
  registerSubmitObj.offsetWidth; // Trick to restart animation by causing a reflow
  registerSubmitObj.classList.add('text_fade_in');
}

function clearDataErrors() {
  registerSubmitTextObj.nodeValue = '';
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
}

function validateCompanyData() {
  if (userTypeObj.value == 'person') {
    return null;
  }

  var postValidator = 'postalCode'
  if (companyCountryObj.value == 'ES') {
    postValidator = 'postalCodeEs'
  }

  return {
    name: InputHelper.validate(companyNameObj, {required: true, length: [2, 256]}, onValidationError.bind(companyNameReportObj)),
    cif: InputHelper.validate(cifObj, {required: true, op: 'cif'}, onValidationError.bind(cifReportObj)),
    address: InputHelper.validate(companyAddressObj, {required: true, length: [2, 256]}, onValidationError.bind(companyAddressReportObj)),
    postalCode: InputHelper.validate(companyPostalCodeObj, {required: true, op: postValidator}, onValidationError.bind(companyPostalCodeReportObj)),
    city: InputHelper.validate(companyCityObj, {required: true, length: [1, 140]}, onValidationError.bind(companyCityReportObj)),
    region: InputHelper.validate(companyRegionObj, {required: true, length: [1, 140]}, onValidationError.bind(companyRegionReportObj)),
    country: companyCountryObj.value
  };
}

function processUserDataResponse(status, statusText, response) {
  if (status == 200) {
    user = response;
    renderDocsPanel();
    onTabClick(4);
  } else if (status == 422) {
    showSubmitError('Algún dato del formulario no es válido.');
  } else {
    showSubmitError('Se ha producido un error conectando con el servidor.');
  }
}

function renderDocsPanel() {
  if (user.userType == 'person') {
    cyDoc1Obj.style.display = 'none';
    cyDoc2Obj.style.display = 'none';
    cyDoc3Obj.style.display = 'none';

    if (user.nationalIdType == 'national') {
      nifLabelObj.nodeValue = 'DNI (por las dos caras)';
      ppDocObj.style.display = 'none';
    } else {
      nifLabelObj.nodeValue = 'NIE (por las dos caras)';
      ppLabelObj.nodeValue = 'Pasaporte';
      ppDocObj.style.display = 'list-item';
    }
    return;
  }

  cyDoc1Obj.style.display = 'list-item';
  cyDoc2Obj.style.display = 'list-item';
  cyDoc3Obj.style.display = 'list-item';
  
  if (user.nationalIdType == 'national') {
    nifLabelObj.nodeValue = 'DNI del representante legal (por las dos caras)';
    ppDocObj.style.display = 'none';
  } else {
    nifLabelObj.nodeValue = 'NIE del representante legal (por las dos caras)';
    ppLabelObj.nodeValue = 'Pasaporte del representante legal';
    ppDocObj.style.display = 'list-item';
  }
}

function validateDocs() {
  uploadSubmitTextObj.nodeValue = '';

  var docs = {
    id: null,
    passport: null,
    companyTitle: null,
    companyProof: null,
    seniorPartners: null
  };

  docs.id = getAttachment(nifUploadObj, nifErrorObj);  
  if (!docs.id) {
    showUploadSubmitError('Datos incorrectos, revisa el formulario');
    return false;
  }

  if (user.nationalIdType == 'foreign') {
    docs.passport = getAttachment(ppUploadObj, ppErrorObj);
    
    if (!docs.passport) {
      showUploadSubmitError('Datos incorrectos, revisa el formulario');
      return false;
    }
  }

  if (user.userType == 'company') {
    docs.companyTitle = getAttachment(cyDoc1UploadObj, cyDoc1ErrorObj);
    docs.companyProof = getAttachment(cyDoc2UploadObj, cyDoc2ErrorObj);
    
    var doc3 = cyDoc3UploadObj.files && cyDoc3UploadObj.files[0];
    if (doc3) {
      docs.seniorPartners = getAttachment(cyDoc3UploadObj, cyDoc3ErrorObj)
    }

    if (!docs.companyTitle || !docs.companyProof || (doc3 && !docs.seniorPartners)) {
      showUploadSubmitError('Datos incorrectos, revisa el formulario');
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
    'POST',
    data,
    processUploadSubmitComplete,
    { loading: true, msg: 'Enviando documentos' });

  return false;
}

function processUploadSubmitComplete(status, statusText, response) {
  if (status == 200) {
    window.location.href = 'home';
  } else if (status == 422) {
    showUploadSubmitError('Algún dato del formulario no es válido.');
  } else {
    showUploadSubmitError('Se ha producido un error conectando con el servidor.');
  }
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

function showUploadSubmitError(msg) {
  uploadSubmitTextObj.nodeValue = msg;
  uploadSubmitObj.classList.remove('text_fade_in');
  uploadSubmitObj.offsetWidth; // Trick to restart animation by causing a reflow
  uploadSubmitObj.classList.add('text_fade_in');
}

function clearDocsErrors() {
  uploadSubmitTextObj.nodeValue = '';
  nifErrorObj.nodeValue = '';
  ppErrorObj.nodeValue = '';
  cyDoc1ErrorObj.nodeValue = '';
  cyDoc2ErrorObj.nodeValue = '';
}
