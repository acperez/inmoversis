'use strict';

var ProjectForm = (function() {

  var isUpdateForm = false;
  var preview = null;
  var image = null;
  var photos = [];
  var documents = [];
  var isSellEnabled = false;
  var isRentEnabled = false;
  var attachments = {};
  var map = null;
  var mapLocation = {};

  // Form element
  var formObj;

  // Tab elements
  var tabs = [];
  var currentTab;

  // Project elements
  var nameObj, subnameObj, labelObj, campaignDurationObj, keyPointsObj, projectDurationObj, statusObj, updateFieldsObj;
  var projectBalanceObj, previewInputObj, previewButtonObj, previewObj, imageInputObj, imageButtonObj, imageObj;

  // House elements
  var houseDescriptionObj, addressObj, mapObj, sizeObj, roomsObj, wcObj, houseStatusObj;
  var typeObj, pricePerMeterObj, photosInputObj, photosButtonObj, photosObj;

  // Finances elements
  var financialsDescriptionObj, purchasePriceObj, purchaseTaxesObj, purchaseRefurbishmentObj, purchaseUnforeseenObj;
  var purchaseTotalPriceObj, sellEnableObj, sellPanelObj, sellPriceObj, sellProfitabilityObj, sellFeeObj;
  var sellFeeNominalObj, sellValueAddedTaxObj, sellValueAddedTaxNominalObj, sellNetProfitabilityObj;
  var sellCorporateTaxObj, sellCorporateTaxNominalObj, sellCorporateProfitObj, sellManagementFeeObj;
  var sellManagementFeeNominalObj, sellPropertyDeveloperFeeObj, sellPropertyDeveloperFeeNominalObj, sellPlatformProfitObj;
  var sellInvestorProfitabilityObj, rentEnableObj, rentPanelObj, rentPaymentObj, rentProfitabilityObj, rentInsuranceObj;
  var rentHomeInsuranceObj, rentIbiObj, rentCommunityExpensesObj, rentUnforeseenObj, rentEarningsObj, rentNetProfitabilityObj;
  var rentAmortizationObj, rentCorporateTaxObj, rentCorporateTaxNominalObj, rentCorporateProfitObj, rentPlatformFeeObj;
  var rentPlatformProfitObj, rentInvestorProfitabilityObj, totalProfitabilityObj;

  // Document elements
  var documentsInputObj, documentsButtonObj, documentsObj;

  // Submit elements
  var sendObj, updateObj, reportObj, reportMessageObj;

  function init() {
    formObj = document.getElementById('project_form');
    initTabs();
    initProjectFields();
    initHouseFields();
    initFinancesFields();
    initDocumentFields();
    initSubmitForm();
  }

  function initTabs() {
    currentTab = 0;
    addTab('form_tab_1', 'step1');
    addTab('form_tab_2', 'step2');
    addTab('form_tab_3', 'step3');
    addTab('form_tab_4', 'step4');
    addTab('form_tab_5', 'step5');
  }

  function initProjectFields() {
    nameObj = initValidatedField('name');
    subnameObj = document.getElementById('subname');
    labelObj = document.getElementById('label');
    campaignDurationObj = initValidatedIntField('campaign_duration');
    keyPointsObj = document.getElementById('key_points');
    projectDurationObj = initValidatedIntField('project_duration');
    statusObj = document.getElementById('status');
    updateFieldsObj = document.getElementById('update_fields');
    projectBalanceObj = initValidatedNumberField('project_balance');

    imageObj = document.getElementById('image');
    imageInputObj = initInputFile('image_input', showImage);
    imageButtonObj = initButtonInputFile('image_button', imageInputObj);

    previewObj = document.getElementById('preview');
    previewInputObj = initInputFile('preview_input', showPreview);
    previewButtonObj = initButtonInputFile('preview_button', previewInputObj);
  }

  function initHouseFields() {
    houseDescriptionObj = initValidatedField('house_description');
    addressObj = initValidationMap('address');
    mapObj = document.getElementById('map');
    sizeObj = initValidatedIntField('size');
    roomsObj = initValidatedIntField('rooms');
    wcObj = initValidatedIntField('wc');
    houseStatusObj = initValidatedField('house_status');
    typeObj = initValidatedField('type');
    pricePerMeterObj = initValidatedNumberField('price_per_meter');

    photosObj = document.getElementById('photos');
    photosInputObj = initInputFile('photos_input', handleFileSelect);
    photosButtonObj = initButtonInputFile('photos_button', photosInputObj);
  }

  function initFinancesFields() {
    financialsDescriptionObj = initValidatedField('financials_description');

    purchasePriceObj = initValidatedNumberFieldAction('purchase_price', handlePurchaseExpenses);
    purchaseTaxesObj = initValidatedNumberFieldAction('purchase_taxes', handlePurchaseExpenses);
    purchaseRefurbishmentObj = initValidatedNumberFieldAction('purchase_refurbishment', handlePurchaseExpenses);
    purchaseUnforeseenObj = initValidatedNumberFieldAction('purchase_unforeseen', handlePurchaseExpenses);
    purchaseTotalPriceObj = document.getElementById('purchase_total_price');

    sellPanelObj = document.getElementById('sell_panel');
    sellEnableObj = initActionClick('sell_enable', toggleSell); 
    sellPriceObj = initValidatedNumberFieldAction('sell_price', handleSellProfitability);
    sellProfitabilityObj = document.getElementById('sell_profitability');
    sellFeeObj = initValidatedNumberFieldAction('sell_fee', handleSellFee);
    sellFeeNominalObj = document.getElementById('sell_fee_nominal');
    sellValueAddedTaxObj = initValidatedNumberFieldAction('sell_value_added_tax', handleSellValueAddedTax);
    sellValueAddedTaxNominalObj = document.getElementById('sell_value_added_tax_nominal');
    sellNetProfitabilityObj = document.getElementById('sell_net_profitability');
    sellCorporateTaxObj = initValidatedNumberFieldAction('sell_corporate_tax', handleSellCorporateTax);
    sellCorporateTaxNominalObj = document.getElementById('sell_corporate_tax_nominal');
    sellCorporateProfitObj = document.getElementById('sell_corporate_profit');
    sellManagementFeeObj = initValidatedNumberFieldAction('sell_management_fee', handleSellManagementFee);
    sellManagementFeeNominalObj = document.getElementById('sell_management_fee_nominal');
    sellPropertyDeveloperFeeObj = initValidatedNumberFieldAction('sell_property_developer_fee', handleSellPropertyDeveloperFee);
    sellPropertyDeveloperFeeNominalObj = document.getElementById('sell_property_developer_fee_nominal');
    sellPlatformProfitObj = document.getElementById('sell_platform_profit');
    sellInvestorProfitabilityObj = document.getElementById('sell_investor_profitability');

    rentPanelObj = document.getElementById('rent_panel');
    rentEnableObj = initActionClick('rent_enable', toggleRent);
    rentPaymentObj = initValidatedNumberFieldAction('rent_payment', handleRentEarnings);
    rentProfitabilityObj = document.getElementById('rent_profitability');
    rentInsuranceObj = initValidatedNumberFieldAction('rent_insurance', handleRentEarnings);
    rentHomeInsuranceObj = initValidatedNumberFieldAction('rent_home_insurance', handleRentEarnings);
    rentIbiObj = initValidatedNumberFieldAction('rent_ibi', handleRentEarnings);
    rentCommunityExpensesObj = initValidatedNumberFieldAction('rent_community_expenses', handleRentEarnings);
    rentUnforeseenObj = initValidatedNumberFieldAction('rent_unforeseen', handleRentEarnings);
    rentEarningsObj = document.getElementById('rent_earnings');
    rentNetProfitabilityObj = document.getElementById('rent_net_profitability');
    rentAmortizationObj = initValidatedNumberFieldAction('rent_amortization', handleRentCorporateProfit);
    rentCorporateTaxObj = initValidatedNumberFieldAction('rent_corporate_tax', handleRentCorporateTax);
    rentCorporateTaxNominalObj = document.getElementById('rent_corporate_tax_nominal');
    rentCorporateProfitObj = document.getElementById('rent_corporate_profit');
    rentPlatformFeeObj = initValidatedNumberFieldAction('rent_platform_fee', handleRentPlatformProfit);
    rentPlatformProfitObj = document.getElementById('rent_platform_profit');
    rentInvestorProfitabilityObj = document.getElementById('rent_investor_profitability');

    totalProfitabilityObj = document.getElementById('total_profitability');
  }

  function initDocumentFields() {
    documentsObj = document.getElementById('documents');
    documentsInputObj = initInputFile('documents_input', handleDocuments);
    documentsButtonObj = initButtonInputFile('documents_button', documentsInputObj);
  }

  function initSubmitForm() {
    sendObj = initActionClick('send', submitNewProject);
    updateObj = initActionClick('update', updateProject);
    reportObj = document.getElementById('report');
    reportMessageObj = document.createTextNode('');
    reportObj.appendChild(reportMessageObj);
  }

  // Load element helpers

  function addTab(tabId, panelId) {
    var tabObj = document.getElementById(tabId);
    var panelObj = document.getElementById(panelId);
    var index = tabs.length;
    tabObj.addEventListener('click', function(evt) { onFormTabClick(index); });
    tabs.push({ tab: tabObj,
                panel: panelObj });
  }

  function initValidatedField(id) {
    var element = document.getElementById(id);
    element.addEventListener('focus', function(evt) { clearValidation(element); });
    return element;
  }

  function initValidatedNumberField(id) {
    var element = document.getElementById(id);
    element.addEventListener('focus', function(evt) { clearValidation(element); });
    element.addEventListener('keypress', function(evt) { filterNumber(evt); });
    return element;
  }

  function initValidatedNumberFieldAction(id, action) {
    var element = document.getElementById(id);
    element.addEventListener('focus', function(evt) { clearValidation(element); });
    element.addEventListener('keypress', function(evt) { filterNumber(evt); });
    element.addEventListener('keyup', function(evt) { action(); });
    return element;
  }

  function initValidatedIntField(id) {
    var element = document.getElementById(id);
    element.addEventListener('focus', function(evt) { clearValidation(element); });
    element.addEventListener('keypress', function(evt) { filterInt(evt); });
    return element;
  }

  function initInputFile(id, func) {
    var element = document.getElementById(id);
    element.addEventListener('change', function(evt) { func(element); });
    return element;
  }

  function initButtonInputFile(id, input) {
    var element = document.getElementById(id);
    element.addEventListener('click', function(evt) { input.click(); });
    return element;
  }

  function initValidationMap(id) {
    var element = document.getElementById(id);
    element.addEventListener('focus', function(evt) { clearValidation(element); });
    element.addEventListener('blur', function(evt) { loadLocation(element.value); });
    return element;
  }

  function initActionClick(id, func) {
    var element = document.getElementById(id);
    element.addEventListener('click', function(evt) { func(); });
    return element;
  }

  function clearValidation(element) {
    element.classList.remove('error');
  }

  function filterNumber(event) {
    if (event.charCode != 46 && event.charCode < 48 || event.charCode > 57) {
      event.preventDefault();
    }
  }

  function filterInt(event) {
    if (event.charCode < 48 || event.charCode > 57) {
      event.preventDefault();
    }
  }

  function showForm(project) {
    if (project) {
      isUpdateForm = true;
      sendObj.style.display = 'none';
      updateFieldsObj.style.display = 'block';
      updateObj.style.display = 'inline-block';
      loadProject(project);
    } else {
      isUpdateForm = false;
      sendObj.style.display = 'inline-block';
      updateObj.style.display = 'none';
      updateFieldsObj.style.display = 'none';
      clearForm();
    }

    onFormTabClick(0); 
    formObj.style.display = 'block';
  }

  function hideForm() {
    formObj.style.display = 'none';
  }

  /* Form tab manager */
  function onFormTabClick(option) {
    if (option == currentTab) {
      return;
    }

    var current = tabs[currentTab];
    var next = tabs[option];

    current.panel.style.display = 'none';
    current.tab.classList.remove('form_progress_select');

    next.panel.style.display = 'block';
    next.tab.firstElementChild.style.backgroundColor = '#1990EF';
    next.tab.classList.add('form_progress_select');

    if (option == 1 && window.google) {
      google.maps.event.trigger(map, 'resize');
      map.setCenter(mapLocation);
    }

    if (currentTab == 4) {
      reportMessageObj.nodeValue = '';
    }

    currentTab = option;
  }

  /* Google maps plugin */
  function initGoogleMaps() {
    if (!window.google) {
      return;
    }

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      'address': 'barcelona'
    }, function(results, status) {
      mapLocation = results[0].geometry.location;
      var mapOptions = {
        center: mapLocation,
        zoom: 12,
        scrollwheel: false,
      }
      map = new google.maps.Map(mapObj, mapOptions);
    });
  }

  function loadLocation(address) {
    if (!address || !address.trim().length || !window.google) {
      return;
    }

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      'address': address
    }, function(results, status) {
      addressObj.value = results[0].formatted_address;
      mapLocation = results[0].geometry.location;
      map.setCenter(mapLocation);
      map.setZoom(15);
      var marker = new google.maps.Marker({
        position: mapLocation,
        map: map
      });
    });
  }

  /* Preview of the project */
  function showPreview(fileInput) {
    if (!fileInput.files && !fileInput.files[0]) {
      return;
    }

    var file = fileInput.files[0];
    if (!file.type.match("image.*")) {
      return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
      previewObj.src = e.target.result;
    }

    preview = { file: file,
                name: file.name };
    reader.readAsDataURL(file);
  }

  function showPreviewDownload(file, callback) {
    if (!file.type.match("image.*")) {
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      previewObj.src = e.target.result;
    }

    preview = { file: file,
                name: file.name };
    reader.readAsDataURL(file);
    callback();
  }

  /* Image of the project */
  function showImage(fileInput) {
    if (!fileInput.files && !fileInput.files[0]) {
      return;
    }

    var file = fileInput.files[0];
    if (!file.type.match("image.*")) {
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      imageObj.src = e.target.result;
    }

    image = { file: file,
              name: file.name };
    reader.readAsDataURL(file);
  }

  function showImageDownload(file, callback) {
    if (!file.type.match("image.*")) {
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      imageObj.src = e.target.result;
    }

    image = { file: file,
              name: file.name };
    reader.readAsDataURL(file);

    callback();
  }

  /* Photos manager */
  function handleFileSelect(input) {
    if (!input.files || !window.FileReader) {
      return;
    }

    var files = input.files;
    for (var i = 0; i < files.length; i++) {
      var file = input.files[i];
      if (!file.type.match("image.*")) {
        return;
      }

      var reader = new FileReader();
      reader.onload = (function(file) {
        return function(e) {
          addPhoto(file, e.target.result);
        }
      })(file);

      reader.readAsDataURL(file);
    };		
  }

  function handleFileDownload(file, callback) {
    if (!window.FileReader) {
      return;
    }

    if (!file.type.match("image.*")) {
      return;
    }

    var reader = new FileReader();
    reader.onload = (function(file) {
      return function(e) {
        addPhoto(file, e.target.result);
        callback()
      }
    })(file);

    reader.readAsDataURL(file);
  }

  function addPhoto(file, blob) {
    photos.push({ file: file,
                  name: file.name });

    var div = document.createElement('div');
    div.dataset.position = photos.length - 1;

    var left = document.createElement('img');
    left.src = '/images/left.png';
    left.classList.add('photos_preview');
    left.style.cursor = 'pointer';
    left.onclick = function() {
      moveLeft(div);
    };

    var right = document.createElement('img');
    right.src = '/images/right.png'
    right.classList.add('photos_preview');
    right.style.cursor = 'pointer';
    right.style.visibility = 'hidden';
    right.onclick = function() {
      moveRight(div);
    };

    var img = document.createElement('img');
    img.classList.add('preview_img','photos_preview');
    img.src = blob;

    var container = document.createElement('p');
    container.appendChild(left);
    container.appendChild(img);
    container.appendChild(right);
    div.appendChild(container);

    var label = document.createElement('p');
    label.appendChild(document.createTextNode(file.name));
    label.classList.add('label_preview');

    var del = document.createElement("img");
    del.src = '/images/del.png';
    del.classList.add('del_preview');
    del.onclick = function() {
      delPhoto(div);
    };

    label.appendChild(del);

    div.appendChild(label);

    if (photosObj.childNodes.length == 0) {
      left.style.visibility = 'hidden';
    } else {
      setRightVisible(photosObj.lastChild, true);
    }

    photosObj.appendChild(div);
  }

  function setLeftVisible(element, visible) {
    element.firstChild.childNodes[0].style.visibility = visible ? 'visible' : 'hidden';
  }

  function setRightVisible(element, visible) {
    element.firstChild.childNodes[2].style.visibility = visible ? 'visible' : 'hidden';
  }

  function moveLeft(element) {
    var position = parseInt(element.dataset.position);
    element.parentNode.insertBefore(element, element.previousSibling);
    if (position == 1) {
      setLeftVisible(element, false);
      setLeftVisible(element.nextSibling, true);
    }

    if (position == element.parentNode.childNodes.length - 1) {
      setRightVisible(element, true);
      setRightVisible(element.nextSibling, false);
    }

    var aux = photos[position - 1];
    photos[position - 1] = photos[position];
    photos[position] = aux;

    element.dataset.position = position - 1;
    element.nextSibling.dataset.position = position;
  }

  function moveRight(element) {
    var position = parseInt(element.dataset.position);
    element.parentNode.insertBefore(element.nextSibling, element);
    if (position == 0) {
      setLeftVisible(element, true);
      setLeftVisible(element.previousSibling, false);
    }

    if (position == element.parentNode.childNodes.length - 2) {
      setRightVisible(element, false);
      setRightVisible(element.previousSibling, true);
    }

    var aux = photos[position + 1];
    photos[position + 1] = photos[position];
    photos[position] = aux;

    element.dataset.position = position + 1;
    element.previousSibling.dataset.position = position;
  }

  function delPhoto(element) {
    var position = parseInt(element.dataset.position);
    var parent = element.parentNode;
    parent.removeChild(element);

    if (parent.childNodes.length == 0) {
      photos = [];
      return;
    }

    if (position == 0) {
      setLeftVisible(parent.firstChild, false);
    }

    if (position == parent.childNodes.length) {
      setRightVisible(parent.lastChild, false);
    }

    photos.splice(position, 1);

    for (var i = position; i < parent.childNodes.length; i++) {
      parent.childNodes[i].dataset.position = i;
    }
  }

  /* Documents manager */
  function handleDocuments(input) {
    if (!input.files || !window.FileReader) {
      return;
    }

    for (var x = 0; x < input.files.length; x++) {
      addDocument(input.files[x]);
    }
  }

  function handleDocumentsDownload(doc, callback, text) {
    addDocument(doc, text);
    callback();
  }

  function addDocument(file, text) {
    documents.push({ file: file,
                     name: file.name });

    var container = document.createElement('div');
    container.dataset.position = documents.length - 1;

    var p = document.createElement('p');
    p.appendChild(document.createTextNode(file.name));
    p.classList.add('document_name', 'truncate_string');

    var name = document.createElement('input');
    name.type = 'text';
    name.classList.add('admin_input');
    name.onfocus = function() {
      clearValidation(name);
    };

    if (text) {
      name.value = text;
    }

    var del = document.createElement("img");
    del.classList.add('del_preview');
    del.src = '/images/del.png';
    del.onclick = function() {
      delDocument(container);
    };

    var div = document.createElement('div');
    div.appendChild(p);
    div.appendChild(name);
    div.appendChild(del);

    var up = document.createElement('img');
    up.src = '/images/up.png';
    up.classList.add('vertical_arrows');
    up.onclick = function() {
      moveUp(container);
    };

    var down = document.createElement('img');
    down.src = '/images/down.png'
    down.classList.add('vertical_arrows');
    down.style.visibility = 'hidden';
    down.onclick = function() {
      moveDown(container);
    };

    container.classList.add('document_element');
    container.appendChild(up);
    container.appendChild(div);
    container.appendChild(down);

    if (documentsObj.childNodes.length == 0) {
      up.style.visibility = 'hidden';
    } else {
      setDownVisible(documentsObj.lastChild, true);
    }
    documentsObj.appendChild(container);
  }

  function setUpVisible(element, visible) {
    element.firstChild.style.visibility = visible ? 'visible' : 'hidden';
  }

  function setDownVisible(element, visible) {
    element.lastChild.style.visibility = visible ? 'visible' : 'hidden';
  }

  function moveUp(element) {
    var position = parseInt(element.dataset.position);
    element.parentNode.insertBefore(element, element.previousSibling);
    if (position == 1) {
      setUpVisible(element, false);
      setUpVisible(element.nextSibling, true);
    }

    if (position == element.parentNode.childNodes.length - 1) {
      setDownVisible(element, true);
      setDownVisible(element.nextSibling, false);
    }

    var aux = documents[position - 1];
    documents[position - 1] = documents[position];
    documents[position] = aux;

    element.dataset.position = position - 1;
    element.nextSibling.dataset.position = position;
  }

  function moveDown(element) {
    var position = parseInt(element.dataset.position);
    element.parentNode.insertBefore(element.nextSibling, element);
    if (position == 0) {
      setUpVisible(element, true);
      setUpVisible(element.previousSibling, false);
    }

    if (position == element.parentNode.childNodes.length - 2) {
      setDownVisible(element, false);
      setDownVisible(element.previousSibling, true);
    }

    var aux = documents[position + 1];
    documents[position + 1] = documents[position];
    documents[position] = aux;

    element.dataset.position = position + 1;
    element.previousSibling.dataset.position = position;
  }

  function delDocument(element) {
    var position = parseInt(element.dataset.position);
    var parent = element.parentNode;
    parent.removeChild(element);

    if (parent.childNodes.length == 0) {
      documents = [];
      return;
    }

    if (position == 0) {
      setUpVisible(parent.firstChild, false);
    }

    if (position == parent.childNodes.length) {
      setDownVisible(parent.lastChild, false);
    }

    documents.splice(position, 1);

    for (var i = position; i < parent.childNodes.length; i++) {
      parent.childNodes[i].dataset.position = i;
    }
  }

  /* Finances sell / rent toogle */
  function setSellEnabled(enabled) {
    isSellEnabled = enabled;
    if (isSellEnabled) {
      sellEnableObj.src = "/images/del_light.png";
      sellPanelObj.style.display = 'block';
      return;
    }

    sellEnableObj.src = "/images/max_light.png";
    sellPanelObj.style.display = 'none';
  }

  function toggleSell() {
    if (isSellEnabled) {
      sellEnableObj.src = "/images/max_light.png";
      isSellEnabled = false;
      handleSellProfitability();
      sellPanelObj.style.display = 'none';
      return;
    }

    sellEnableObj.src = "/images/del_light.png";
    isSellEnabled = true; 
    handleSellProfitability();
    sellPanelObj.style.display = 'block';
  }

  function setRentEnabled(enabled) {
    isRentEnabled = enabled;
    if (isRentEnabled) {
      rentEnableObj.src = "/images/del_light.png";
      rentPanelObj.style.display = 'block';
      return;
    }

    rentEnableObj.src = "/images/max_light.png";
    rentPanelObj.style.display = 'none';
  }

  function toggleRent(element, content) {
    if (isRentEnabled) {
      rentEnableObj.src = "/images/max_light.png";
      isRentEnabled = false;
      handleRentEarnings();
      rentPanelObj.style.display = 'none';
      return;
    }

    rentEnableObj.src = "/images/del_light.png";
    isRentEnabled = true; 
    handleRentEarnings();
    rentPanelObj.style.display = 'block';
  }

  function handlePurchaseExpenses() {
    var purchasePrice = parseFloat(purchasePriceObj.value || 0);
    var purchaseTaxes = parseFloat(purchaseTaxesObj.value || 0);
    var purchaseRefurbishment = parseFloat(purchaseRefurbishmentObj.value || 0);
    var purchaseUnforeseen = parseFloat(purchaseUnforeseenObj.value || 0);
    var purchaseTotalPrice = purchasePrice + purchaseTaxes + purchaseRefurbishment + purchaseUnforeseen;
    purchaseTotalPriceObj.value = purchaseTotalPrice;
    clearValidation(purchaseTotalPriceObj);
    handleSellProfitability();
    handleRentProfitability();
  }

  // Sell
  function handleSellProfitability() {
    var totalPrice = parseFloat(purchaseTotalPriceObj.value || 0);
    var sellPrice = parseFloat(sellPriceObj.value || 0);

    var sellProfitability = 0;
    if (totalPrice != 0) {
      sellProfitability = ((sellPrice - totalPrice) / totalPrice) * 100;
    }

    sellProfitabilityObj.value = sellProfitability;
    clearValidation(sellProfitabilityObj);
    handleSellFee();
  }

  function handleSellFee() {
    var sellPrice = parseFloat(sellPriceObj.value || 0);
    var sellFee = parseFloat(sellFeeObj.value || 0);
    var sellFeeNominal = sellPrice * sellFee / 100;
    sellFeeNominalObj.value = sellFeeNominal;
    clearValidation(sellFeeNominalObj);
    handleSellCorporateTax();
    handleSellNetProfitability();
  }

  function handleSellValueAddedTax() {
    var sellValueAddedTax = parseFloat(sellValueAddedTaxObj.value || 0);
    var sellPrice = parseFloat(sellPriceObj.value || 0);
    var purchasePrice = parseFloat(purchasePriceObj.value || 0);
    var sellValueAddedTaxNominal = (sellPrice - purchasePrice) * sellValueAddedTax / 100;
    sellValueAddedTaxNominalObj.value = sellValueAddedTaxNominal;
    clearValidation(sellValueAddedTaxNominalObj);
    handleSellProfit();
    handleSellNetProfitability();
  }

  function handleSellNetProfitability() {
    var sellPrice = parseFloat(sellPriceObj.value || 0);
    var sellValueAddedTaxNominal = parseFloat(sellValueAddedTaxNominalObj.value || 0);
    var sellFeeNominal = parseFloat(sellFeeNominalObj.value || 0);
    var purchaseTotalPrice = parseFloat(purchaseTotalPriceObj.value || 0);

    var sellNetProfitability = 0;
    if (purchaseTotalPrice != 0) {
      sellNetProfitability = ((sellPrice - sellValueAddedTaxNominal - sellFeeNominal - purchaseTotalPrice) / purchaseTotalPrice) * 100;
    }

    sellNetProfitabilityObj.value = sellNetProfitability;
    clearValidation(sellNetProfitabilityObj);
  }

  function handleSellCorporateTax() {
    var sellPrice = parseFloat(sellPriceObj.value || 0);
    var sellFeeNominal = parseFloat(sellFeeNominalObj.value || 0);
    var sellValueAddedTaxNominal = parseFloat(sellValueAddedTaxNominalObj.value || 0);
    var purchaseTotalPrice = parseFloat(purchaseTotalPriceObj.value || 0);
    var purchaseUnforeseen = parseFloat(purchaseUnforeseenObj.value || 0);
    var sellCorporateTax = parseFloat(sellCorporateTaxObj.value || 0);
    var sellCorporateTaxNominal = ((sellPrice - sellFeeNominal - sellValueAddedTaxNominal) - (purchaseTotalPrice - purchaseUnforeseen)) * sellCorporateTax / 100;
    sellCorporateTaxNominalObj.value = sellCorporateTaxNominal;
    clearValidation(sellCorporateTaxNominalObj);
    handleSellProfit();
  }

  function handleSellProfit() {
    var purchaseTotalPrice = parseFloat(purchaseTotalPriceObj.value || 0);
    var sellPrice = parseFloat(sellPriceObj.value || 0);
    var purchaseUnforeseen = parseFloat(purchaseUnforeseenObj.value || 0);
    var sellFeeNominal = parseFloat(sellFeeNominalObj.value || 0);
    var sellValueAddedTax = parseFloat(sellValueAddedTaxNominalObj.value || 0);
    var sellCorporateTax = parseFloat(sellCorporateTaxNominalObj.value || 0);
    var sellCorporateProfit = sellPrice - purchaseTotalPrice + purchaseUnforeseen - sellFeeNominal - sellValueAddedTax - sellCorporateTax;
    sellCorporateProfitObj.value = sellCorporateProfit;
    clearValidation(sellCorporateProfitObj);
    handleSellManagementFee();
  }

  function handleSellManagementFee() {
    var sellCorporateProfit = parseFloat(sellCorporateProfitObj.value || 0);
    var sellManagementFee = parseFloat(sellManagementFeeObj.value || 0);
    var sellManagementFeeNominal = sellCorporateProfit * sellManagementFee / 100;
    sellManagementFeeNominalObj.value = sellManagementFeeNominal;
    clearValidation(sellManagementFeeNominalObj);
    handleSellPlatformProfit();
    handleSellInvestorProfitability();
  }

  function handleSellPropertyDeveloperFee() {
    var purchasePrice = parseFloat(purchasePriceObj.value || 0);
    var sellPropertyDeveloperFee = parseFloat(sellPropertyDeveloperFeeObj.value || 0);
    var sellPropertyDeveloperFeeNominal = purchasePrice * sellPropertyDeveloperFee / 100;
    sellPropertyDeveloperFeeNominalObj.value = sellPropertyDeveloperFeeNominal;
    clearValidation(sellPropertyDeveloperFeeNominalObj);
    handleSellPlatformProfit();
  }

  function handleSellPlatformProfit() {
    var sellManagementFeeNominal = parseFloat(sellManagementFeeNominalObj.value || 0);
    var sellPropertyDeveloperFeeNominal = parseFloat(sellPropertyDeveloperFeeNominalObj.value || 0);
    var sellPlatformProfit = sellManagementFeeNominal + sellPropertyDeveloperFeeNominal;
    sellPlatformProfitObj.value = sellPlatformProfit;
    clearValidation(sellPlatformProfitObj);
  }

  function handleSellInvestorProfitability() {
    var sellCorporateProfit = parseFloat(sellCorporateProfitObj.value || 0);
    var sellManagementFeeNominal = parseFloat(sellManagementFeeNominalObj.value || 0);
    var purchaseTotalPrice = parseFloat(purchaseTotalPriceObj.value || 0);

    var sellInvestorProfitability = 0;
    if (purchaseTotalPrice != 0) {
      sellInvestorProfitability = (sellCorporateProfit - sellManagementFeeNominal) / purchaseTotalPrice * 100;
    }

    sellInvestorProfitabilityObj.value = sellInvestorProfitability;
    clearValidation(sellInvestorProfitabilityObj);
    handleTotalProfitability();
  }

  // Rent
  function handleRentEarnings() {
    var rentPayment = parseFloat(rentPaymentObj.value || 0);
    var rentInsurance = parseFloat(rentInsuranceObj.value || 0);
    var rentHomeInsurance = parseFloat(rentHomeInsuranceObj.value || 0);
    var rentIbi = parseFloat(rentIbiObj.value || 0);
    var rentCommunityExpenses = parseFloat(rentCommunityExpensesObj.value || 0);
    var rentUnforeseen = parseFloat(rentUnforeseenObj.value || 0);
    var rentEarnings = rentPayment - rentInsurance - rentHomeInsurance - rentIbi - rentCommunityExpenses - rentUnforeseen;
    rentEarningsObj.value = rentEarnings;
    clearValidation(rentEarningsObj);
    handleRentProfitability();
  }

  function handleRentProfitability() {
    var rentPayment = parseFloat(rentPaymentObj.value || 0);
    var purchaseTotalPrice = parseFloat(purchaseTotalPriceObj.value || 0);

    var rentProfitability = 0;
    if (purchaseTotalPrice != 0) {
      rentProfitability = rentPayment * 12 / purchaseTotalPrice * 100;
    }

    rentProfitabilityObj.value = rentProfitability;
    clearValidation(rentProfitabilityObj);
    handleRentNetProfitability();
  }

  function handleRentNetProfitability() {
    var rentEarnings = parseFloat(rentEarningsObj.value || 0);
    var purchaseTotalPrice = parseFloat(purchaseTotalPriceObj.value || 0);

    var rentNetProfitability = 0;
    if (purchaseTotalPrice != 0) {
      rentNetProfitability = rentEarnings * 12 / purchaseTotalPrice * 100;
    }

    rentNetProfitabilityObj.value = rentNetProfitability;
    clearValidation(rentNetProfitabilityObj);
    handleRentCorporateTax();
  }

  function handleRentCorporateTax() {
    var rentPayment = parseFloat(rentPaymentObj.value || 0);
    var rentEarnings = parseFloat(rentEarningsObj.value || 0);
    var rentCorporateTax = parseFloat(rentCorporateTaxObj.value || 0);
    var rentCorporateTaxNominal = (rentPayment - rentEarnings) * rentCorporateTax / 100;
    rentCorporateTaxNominalObj.value = rentCorporateTaxNominal;
    clearValidation(rentCorporateTaxNominalObj);
    handleRentCorporateProfit();
  }

  function handleRentCorporateProfit() {
    var rentEarnings = parseFloat(rentEarningsObj.value || 0);
    var rentAmortization = parseFloat(rentAmortizationObj.value || 0);
    var rentCorporateTaxNominal = parseFloat(rentCorporateTaxNominalObj.value || 0);
    var rentCorporateProfit = rentEarnings - rentAmortization - rentCorporateTaxNominal;
    rentCorporateProfitObj.value = rentCorporateProfit;
    clearValidation(rentCorporateProfitObj);
    handleRentPlatformProfit();
  }

  function handleRentPlatformProfit() {
    var rentCorporateProfit = parseFloat(rentCorporateProfitObj.value || 0);
    var rentPlatformFee = parseFloat(rentPlatformFeeObj.value || 0);
    var rentPlatformProfit = rentCorporateProfit * rentPlatformFee / 100;
    rentPlatformProfitObj.value = rentPlatformProfit;
    clearValidation(rentPlatformProfitObj);
    handleRentInvestorProfitability();
  }

  function handleRentInvestorProfitability() {
    var rentCorporateProfit = parseFloat(rentCorporateProfitObj.value || 0);
    var rentPlatformProfit = parseFloat(rentPlatformProfitObj.value || 0);
    var purchaseTotalPrice = parseFloat(purchaseTotalPriceObj.value || 0);

    var rentInvestorProfitability = 0;
    if (purchaseTotalPrice != 0) {
      rentInvestorProfitability = (rentCorporateProfit - rentPlatformProfit) * 12 / purchaseTotalPrice * 100;
    }

    rentInvestorProfitabilityObj.value = rentInvestorProfitability;
    clearValidation(rentInvestorProfitabilityObj);
    handleTotalProfitability();
  }

  function handleTotalProfitability() {
    var sellInvestorProfitability = 0;
    var rentInvestorProfitability = 0;

    if (isSellEnabled) {
      sellInvestorProfitability = parseFloat(sellInvestorProfitabilityObj.value || 0);
    }

    if (isRentEnabled) {
      rentInvestorProfitability = parseFloat(rentInvestorProfitabilityObj.value || 0);
    }

    var totalProfitability = sellInvestorProfitability + rentInvestorProfitability;
    totalProfitabilityObj.value = totalProfitability;
    clearValidation(totalProfitabilityObj);
  }

  function addAttachment(element) {
    var attachment = attachments[element.name];
    if (!attachment) {
      attachments[element.name] = element;
      return element.name;
    }

    if (attachment.file.size == element.file.size) {
      return element.name;
    }

    var ext = element.file.name.lastIndexOf('.');
    if (ext < 1) {
      ext = element.file.name.length;
    }
    var name = element.name.substring(0, ext) + element.file.size + element.name.substring(ext);
    if (!attachments[name]) {
      attachments[name] = { file: element.file,
                            name: name};
    }
    return name;
  }

  /* Submit and validate */
  function reportError(error) {
    reportObj.classList.remove('text_fade_in');
    reportObj.offsetWidth; // Trick to restart animation by causing a reflow
    reportObj.classList.add('text_fade_in');
    reportMessageObj.nodeValue = error;
  }

  function prepareForm() {
    var project = validateProject();
    var house = validateHouse();
    var finances = validateFinances();
    var docs = validateDocuments();

    if (project == null || house == null || finances == null || docs == null) {
      reportError('Hay errores en el formulario, revisa los campos marcados en rojo y vuelve a intentarlo');
      return false;
    }

    if (image) {
      project.image = addAttachment(image);
    }

    if (preview) {
      project.preview = addAttachment(preview);
    }

    house.photos = [];
    for (var i = 0; i < photos.length; i++) {
      house.photos.push({file: addAttachment(photos[i])});
    }

    for (var i = 0; i < documents.length; i++) {
      docs[i].filename = addAttachment(documents[i]);
      docs[i].filesize = documents[i].file.size;
    }

    project.house = house;
    project.finances = finances;
    project.documents = docs;

    var formData = new FormData();
    formData.append('data', JSON.stringify(project));
    for (var name in attachments) {
      formData.append("attachment", attachments[name].file, name);
    }

    return formData;
  }

  function submitNewProject() {
    var data = prepareForm();
    if (!data) {
      return false
    }

    showLoading();
    HttpClient.sendFormData('/admin/project', 'POST', data, processSubmitComplete);

    return false;
  }

  function updateProject() {
    var data = prepareForm();
    if (!data) {
      return false;
    }

    var projectId = document.getElementById('project').value;
    showLoading();
    HttpClient.sendFormData('/admin/project/' + projectId, 'PUT', data, processSubmitComplete);

    return false;
  }

  function processErrorResponse() {
    if (status == 413) {
      reportError('El tamaño de los ficheros es superior al limite permitido');
    } else if (status == 422) {
      reportError('Hay errores en el formulario, revisa los campos y vuelve a intentarlo');
    } else if (status == 503) {
      reportError('Se ha producido un error grave durante la actualización del proyecto, contacta con el administrador');
    } else {
      reportError('Lo sentimos, se ha producido un error, intenetalo mas tarde');
    }
  }

  function processSubmitComplete(status, statusText, response) {
    hidePopup();
    if (status != 200) {
      processErrorResponse(status);
      return;
    }

    Projects.refresh();
  }

  function onValidationError(element, error) {
    element.classList.add('error');
  }

  function validateProject() {
    InputHelper.clearValidator();

    var params = {
      name:              InputHelper.validate(nameObj, {required: true}, onValidationError),
      subname:           subnameObj.value,
      label:             labelObj.value,
      campaign_duration: InputHelper.validate(campaignDurationObj, {required: true, op: 'integer'}, onValidationError),
      key_points:        keyPointsObj.value,
      project_duration:  InputHelper.validate(projectDurationObj, {required: true, op: 'integer'}, onValidationError),
      status:            statusObj.value
    }

    if (isUpdateForm) {
      params.balance = InputHelper.validate(projectBalanceObj, {required: true, op: 'number'}, onValidationError);
    }

    if (InputHelper.validationErrors()) {
      tabs[0].tab.firstElementChild.style.backgroundColor = 'red';
      return null;
    }

    tabs[0].tab.firstElementChild.style.backgroundColor = 'green';

    return params;
  }

  function validateHouse() {
    InputHelper.clearValidator();

    var params = {
      description:     InputHelper.validate(houseDescriptionObj, {required: true}, onValidationError),
      address:         InputHelper.validate(addressObj, {required: true}, onValidationError),
      location:        { lat: mapLocation.lat(), lon: mapLocation.lng() },
      size:            InputHelper.validate(sizeObj, {required: true, op: 'integer'}, onValidationError),
      rooms:           InputHelper.validate(roomsObj, {required: false, op: 'integer'}, onValidationError),
      wc:              InputHelper.validate(wcObj, {required: false, op: 'integer'}, onValidationError),
      status:          InputHelper.validate(houseStatusObj, {required: true}, onValidationError),
      type:            InputHelper.validate(typeObj, {required: true}, onValidationError),
      price_per_meter: InputHelper.validate(pricePerMeterObj, {required: true, op: 'number'}, onValidationError)
    }

    if (InputHelper.validationErrors()) {
      tabs[1].tab.firstElementChild.style.backgroundColor = 'red';
      return null;
    }

    tabs[1].tab.firstElementChild.style.backgroundColor = 'green';

    return params;
  }

  function validateFinances() {
    InputHelper.clearValidator();

    var params = {
      description: InputHelper.validate(financialsDescriptionObj, {required: true}, onValidationError),
      sell_enabled:  isSellEnabled,
      rent_enabled:  isRentEnabled
    };

    params.purchase = {
      price:         InputHelper.validate(purchasePriceObj, {required: true, op: 'number'}, onValidationError),
      taxes:         InputHelper.validate(purchaseTaxesObj, {required: true, op: 'number'}, onValidationError),
      refurbishment: InputHelper.validate(purchaseRefurbishmentObj, {required: true, op: 'number'}, onValidationError),
      unforeseen:    InputHelper.validate(purchaseUnforeseenObj, {required: true, op: 'number'}, onValidationError),
      total_price:   InputHelper.validate(purchaseTotalPriceObj, {required: true, op: 'number'}, onValidationError)
    };

    if (isSellEnabled) {
      params.sell = {
        price:                   InputHelper.validate(sellPriceObj, {required: true, op: 'number'}, onValidationError),
        profitability:           InputHelper.validate(sellProfitabilityObj, {required: true, op: 'number'}, onValidationError),
        fee:                     InputHelper.validate(sellFeeObj, {required: true, op: 'number'}, onValidationError),
        fee_nominal:             InputHelper.validate(sellFeeNominalObj, {required: true, op: 'number'}, onValidationError),
        value_added_tax:         InputHelper.validate(sellValueAddedTaxObj, {required: true, op: 'number'}, onValidationError),
        value_added_tax_nominal: InputHelper.validate(sellValueAddedTaxNominalObj, {required: true, op: 'number'}, onValidationError),
        net_profitability:       InputHelper.validate(sellNetProfitabilityObj, {required: true, op: 'number'}, onValidationError),
        corporate_tax:           InputHelper.validate(sellCorporateTaxObj, {required: true, op: 'number'}, onValidationError),
        corporate_tax_nominal:   InputHelper.validate(sellCorporateTaxNominalObj, {required: true, op: 'number'}, onValidationError),
        corporate_profit:        InputHelper.validate(sellCorporateProfitObj, {required: true, op: 'number'}, onValidationError),
        management_fee:          InputHelper.validate(sellManagementFeeObj, {required: true, op: 'number'}, onValidationError),
        management_fee_nominal:  InputHelper.validate(sellManagementFeeNominalObj, {required: true, op: 'number'}, onValidationError),
        developer_fee:           InputHelper.validate(sellPropertyDeveloperFeeObj, {required: true, op: 'number'}, onValidationError),
        developer_fee_nominal:   InputHelper.validate(sellPropertyDeveloperFeeNominalObj, {required: true, op: 'number'}, onValidationError),
        platform_profit:         InputHelper.validate(sellPlatformProfitObj, {required: true, op: 'number'}, onValidationError),
        investor_profitability:  InputHelper.validate(sellInvestorProfitabilityObj, {required: true, op: 'number'}, onValidationError)
      };
    }

    if (isRentEnabled) {
      params.rent = {
        payment:                InputHelper.validate(rentPaymentObj, {required: true, op: 'number'}, onValidationError),
        profitability:          InputHelper.validate(rentProfitabilityObj, {required: true, op: 'number'}, onValidationError),
        insurance:              InputHelper.validate(rentInsuranceObj, {required: true, op: 'number'}, onValidationError),
        home_insurance:         InputHelper.validate(rentHomeInsuranceObj, {required: true, op: 'number'}, onValidationError),
        ibi:                    InputHelper.validate(rentIbiObj, {required: true, op: 'number'}, onValidationError),
        community_expenses:     InputHelper.validate(rentCommunityExpensesObj, {required: true, op: 'number'}, onValidationError),
        unforeseen:             InputHelper.validate(rentUnforeseenObj, {required: true, op: 'number'}, onValidationError),
        earnings:               InputHelper.validate(rentEarningsObj, {required: true, op: 'number'}, onValidationError),
        net_profitability:      InputHelper.validate(rentNetProfitabilityObj, {required: true, op: 'number'}, onValidationError),
        amortization:           InputHelper.validate(rentAmortizationObj, {required: true, op: 'number'}, onValidationError),
        corporate_tax:          InputHelper.validate(rentCorporateTaxObj, {required: true, op: 'number'}, onValidationError),
        corporate_tax_nominal:  InputHelper.validate(rentCorporateTaxNominalObj, {required: true, op: 'number'}, onValidationError),
        corporate_profit:       InputHelper.validate(rentCorporateProfitObj, {required: true, op: 'number'}, onValidationError),
        platform_fee:           InputHelper.validate(rentPlatformFeeObj, {required: true, op: 'number'}, onValidationError),
        platform_profit:        InputHelper.validate(rentPlatformProfitObj, {required: true, op: 'number'}, onValidationError),
        investor_profitability: InputHelper.validate(rentInvestorProfitabilityObj, {required: true, op: 'number'}, onValidationError)
      };
    }

    params.profitability = InputHelper.validate(totalProfitabilityObj, {required: true, op: 'number'}, onValidationError);

    if (InputHelper.validationErrors()) {
      tabs[2].tab.firstElementChild.style.backgroundColor = 'red';
      return null;
    }

    tabs[2].tab.firstElementChild.style.backgroundColor = 'green';

    return params;
  }

  function validateDocuments() {
    var error = false;

    var docs = [];
    for (var i = 0; i < documentsObj.childNodes.length; i++) {
      var element = documentsObj.childNodes[i];
      var input = element.childNodes[1].childNodes[1];

      var text = input.value;

      if (!text || !text.trim().length) {
        error = true;
        onValidationError(input);
        continue;
      }

      docs.push({ text: text });
    }

    if (error) {
      tabs[3].tab.firstElementChild.style.backgroundColor = 'red';
      return null;
    }

    tabs[3].tab.firstElementChild.style.backgroundColor = 'green';

    return docs;
  }

  function downloadFiles(files, handler, extraParams) {
    var _download = function (index) {
      index++;
      if (files.length <= index) return;
        var path = files[index];
        var name = path.substr(path.lastIndexOf('/') + 1);

        HttpClient.getFile(path, function (status, data) {
        var file = new File([data], name, {type: data.type});
        var extraParam = extraParams ? extraParams[index] : undefined;
        handler(file, function () {
          _download(index)
        }, extraParam);
      });
    }

    _download(-1);
  }

  function clearForm() {
    attachments = {};
    nameObj.value = '';
    subnameObj.value = '';
    labelObj.value = '';
    campaignDurationObj.value = '';
    keyPointsObj.value = '';
    projectDurationObj.value = '';
    statusObj.value = 'hidden';
    projectBalanceObj.value = '';
    imageObj.src = 'static/images/default_preview.jpg';
    image = null;
    previewObj.src = 'static/images/default_preview.jpg';
    preview = null;

    houseDescriptionObj.value = '';
    addressObj.value = '';
    initGoogleMaps();
    sizeObj.value = '';
    roomsObj.value = '';
    wcObj.value = '';
    houseStatusObj.value = '';
    typeObj.value = '';
    pricePerMeterObj.value = '';
    photos = [];
    while (photosObj.firstChild) {
      photosObj.removeChild(photosObj.firstChild);
    }

    financialsDescriptionObj.value = '';
    purchasePriceObj.value = '';
    purchaseTaxesObj.value = '';
    purchaseRefurbishmentObj.value = '';
    purchaseUnforeseenObj.value = '';
    purchaseTotalPriceObj.value = '';

    setSellEnabled(false);
    sellPriceObj.value = '';
    sellProfitabilityObj.value = '';
    sellFeeObj.value = '';
    sellFeeNominalObj.value = '';
    sellValueAddedTaxObj.value = '';
    sellValueAddedTaxNominalObj.value = '';
    sellNetProfitabilityObj.value = '';
    sellCorporateTaxObj.value = '';
    sellCorporateTaxNominalObj.value = '';
    sellCorporateProfitObj.value = '';
    sellManagementFeeObj.value = '';
    sellManagementFeeNominalObj.value = '';
    sellPropertyDeveloperFeeObj.value = '';
    sellPropertyDeveloperFeeNominalObj.value = '';
    sellPlatformProfitObj.value = '';
    sellInvestorProfitabilityObj.value = '';

    setRentEnabled(false);
    rentPaymentObj.value = '';
    rentProfitabilityObj.value = '';
    rentInsuranceObj.value = '';
    rentHomeInsuranceObj.value = '';
    rentIbiObj.value = '';
    rentCommunityExpensesObj.value = '';
    rentUnforeseenObj.value = '';
    rentEarningsObj.value = '';
    rentNetProfitabilityObj.value = '';
    rentAmortizationObj.value = '';
    rentCorporateTaxObj.value = '';
    rentCorporateTaxNominalObj.value = '';
    rentCorporateProfitObj.value = '';
    rentPlatformFeeObj.value = '';
    rentPlatformProfitObj.value = '';
    rentInvestorProfitabilityObj.value = '';

    totalProfitabilityObj.value = '';

    documents = [];
    while (documentsObj.firstChild) {
      documentsObj.removeChild(documentsObj.firstChild);
    }

    clearFormErrors();
  }

  function loadProject(project) {
    var resourcesPrefix = '/admin/project/' + project.projectId + '/' + project.version + '/';
    attachments = {};
    isUpdateForm = true;
    sendObj.style.display = 'none';
    updateFieldsObj.style.display = 'block';
    updateObj.style.display = 'inline-block';

    nameObj.value = project.name;
    subnameObj.value = project.subname;
    labelObj.value = project.label;
    campaignDurationObj.value = project.campaign_duration;
    keyPointsObj.value = project.key_points;
    projectDurationObj.value = project.project_duration;
    statusObj.value = project.status;
    projectBalanceObj.value = project.balance;
    downloadFiles([resourcesPrefix + project.preview], showPreviewDownload);
    downloadFiles([resourcesPrefix + project.image], showImageDownload);

    houseDescriptionObj.value = project.house.description;
    addressObj.value = project.house.address;
    loadLocation(project.house.address);
    sizeObj.value = project.house.size;
    roomsObj.value = project.house.rooms;
    wcObj.value = project.house.wc;
    houseStatusObj.value = project.house.status;
    typeObj.value = project.house.type;
    pricePerMeterObj.value = project.house.price_per_meter;

    photos = [];
    while (photosObj.firstChild) {
      photosObj.removeChild(photosObj.firstChild);
    }

    var photo_files = [];
    for (var i = 0; i < project.house.photos.length; i++) {
      photo_files.push(resourcesPrefix + project.house.photos[i].file);
    }
    downloadFiles(photo_files, handleFileDownload);

    financialsDescriptionObj.value = project.finances.description;
    purchasePriceObj.value = project.finances.purchase.price;
    purchaseTaxesObj.value = project.finances.purchase.taxes;
    purchaseRefurbishmentObj.value = project.finances.purchase.refurbishment;
    purchaseUnforeseenObj.value = project.finances.purchase.unforeseen;
    purchaseTotalPriceObj.value = project.finances.purchase.total_price;

    setSellEnabled(project.finances.sell_enabled);
    if (project.finances.sell_enabled) {
      sellPriceObj.value = project.finances.sell.price;
      sellProfitabilityObj.value = project.finances.sell.profitability;
      sellFeeObj.value = project.finances.sell.fee;
      sellFeeNominalObj.value = project.finances.sell.fee_nominal;
      sellValueAddedTaxObj.value = project.finances.sell.value_added_tax;
      sellValueAddedTaxNominalObj.value = project.finances.sell.value_added_tax_nominal;
      sellNetProfitabilityObj.value = project.finances.sell.net_profitability;
      sellCorporateTaxObj.value = project.finances.sell.corporate_tax;
      sellCorporateTaxNominalObj.value = project.finances.sell.corporate_tax_nominal;
      sellCorporateProfitObj.value = project.finances.sell.corporate_profit;
      sellManagementFeeObj.value = project.finances.sell.management_fee;
      sellManagementFeeNominalObj.value = project.finances.sell.management_fee_nominal;
      sellPropertyDeveloperFeeObj.value = project.finances.sell.developer_fee;
      sellPropertyDeveloperFeeNominalObj.value = project.finances.sell.developer_fee_nominal;
      sellPlatformProfitObj.value = project.finances.sell.platform_profit;
      sellInvestorProfitabilityObj.value = project.finances.sell.investor_profitability;
    }

    setRentEnabled(project.finances.rent_enabled);
    if (project.finances.rent_enabled) {
      rentPaymentObj.value = project.finances.rent.payment;
      rentProfitabilityObj.value = project.finances.rent.profitability;
      rentInsuranceObj.value = project.finances.rent.insurance;
      rentHomeInsuranceObj.value = project.finances.rent.home_insurance;
      rentIbiObj.value = project.finances.rent.ibi;
      rentCommunityExpensesObj.value = project.finances.rent.community_expenses;
      rentUnforeseenObj.value = project.finances.rent.unforeseen;
      rentEarningsObj.value = project.finances.rent.earnings;
      rentNetProfitabilityObj.value = project.finances.rent.net_profitability;
      rentAmortizationObj.value = project.finances.rent.amortization;
      rentCorporateTaxObj.value = project.finances.rent.corporate_tax;
      rentCorporateTaxNominalObj.value = project.finances.rent.corporate_tax_nominal;
      rentCorporateProfitObj.value = project.finances.rent.corporate_profit;
      rentPlatformFeeObj.value = project.finances.rent.platform_fee;
      rentPlatformProfitObj.value = project.finances.rent.platform_profit;
      rentInvestorProfitabilityObj.value = project.finances.rent.investor_profitability;
    }

    totalProfitabilityObj.value = project.finances.profitability;

    documents = [];
    while (documentsObj.firstChild) {
      documentsObj.removeChild(documentsObj.firstChild);
    }

    var document_files = [];
    var document_text = [];
    for (var i = 0; i < project.documents.length; i++) {
      document_files.push(resourcesPrefix + project.documents[i].filename);
      document_text.push(project.documents[i].text);
    }
    downloadFiles(document_files, handleDocumentsDownload, document_text);

    clearFormErrors();
  }

  function clearFormErrors() {
    clearValidation(nameObj);
    clearValidation(subnameObj);
    clearValidation(labelObj);
    clearValidation(campaignDurationObj);
    clearValidation(keyPointsObj);
    clearValidation(projectDurationObj);
    clearValidation(projectBalanceObj);

    clearValidation(houseDescriptionObj);
    clearValidation(addressObj);
    clearValidation(sizeObj);
    clearValidation(roomsObj);
    clearValidation(wcObj);
    clearValidation(houseStatusObj);
    clearValidation(typeObj);
    clearValidation(pricePerMeterObj);

    clearValidation(financialsDescriptionObj);
    clearValidation(purchasePriceObj);
    clearValidation(purchaseTaxesObj);
    clearValidation(purchaseRefurbishmentObj);
    clearValidation(purchaseUnforeseenObj);
    clearValidation(purchaseTotalPriceObj);

    clearValidation(sellPriceObj);
    clearValidation(sellProfitabilityObj);
    clearValidation(sellFeeObj);
    clearValidation(sellFeeNominalObj);
    clearValidation(sellValueAddedTaxObj);
    clearValidation(sellValueAddedTaxNominalObj);
    clearValidation(sellNetProfitabilityObj);
    clearValidation(sellCorporateTaxObj);
    clearValidation(sellCorporateTaxNominalObj);
    clearValidation(sellCorporateProfitObj);
    clearValidation(sellManagementFeeObj);
    clearValidation(sellManagementFeeNominalObj);
    clearValidation(sellPropertyDeveloperFeeObj);
    clearValidation(sellPropertyDeveloperFeeNominalObj);
    clearValidation(sellPlatformProfitObj);
    clearValidation(sellInvestorProfitabilityObj);

    clearValidation(rentPaymentObj);
    clearValidation(rentProfitabilityObj);
    clearValidation(rentInsuranceObj);
    clearValidation(rentHomeInsuranceObj);
    clearValidation(rentIbiObj);
    clearValidation(rentCommunityExpensesObj);
    clearValidation(rentUnforeseenObj);
    clearValidation(rentEarningsObj);
    clearValidation(rentNetProfitabilityObj);
    clearValidation(rentAmortizationObj);
    clearValidation(rentCorporateTaxObj);
    clearValidation(rentCorporateTaxNominalObj);
    clearValidation(rentCorporateProfitObj);
    clearValidation(rentPlatformFeeObj);
    clearValidation(rentPlatformProfitObj);
    clearValidation(rentInvestorProfitabilityObj);

    clearValidation(totalProfitabilityObj);

    for (var i = 0; i < tabs.length; i++) {
      tabs[i].tab.firstElementChild.style.backgroundColor = '#1990EF';
    }
  }

  return {
    init: init,
    initGoogleMaps: initGoogleMaps,
    show: showForm,
    hide: hideForm
  };
}());

