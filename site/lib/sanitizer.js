var log = require('inmoversis_common/logger').getLogger('site'),
  phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance(),
  phoneFormat = require('google-libphonenumber').PhoneNumberFormat,
  phoneType = require('google-libphonenumber').PhoneNumberType,
  sanitizer = require('sanitize-html');

function sanitize(action) {
  return sanitize[action] || (sanitize[action] = function(req, res, next) {

    var operation = sanitizers[action];
    try {
      if (operation.isQuery) {
        req.params = operation.sanitize(req.params);
      } else {
        req.body = operation.sanitize(req.body);
      }
    } catch(error) {
      log.error('Sanitazion failed: ' + error);
      return res.status(422).send();
    }

    next();
  })
}

module.exports.sanitize = sanitize;

var sanitizers = {
  'register': {
    isQuery: false,
    sanitize: function(data) {
      return {
        email: data.email,
        password: data.password,
        name: capitalize(trim(data.name), true)
      }
    }
  },
  'userDetails': {
    isQuery: false,
    sanitize: function(data) {
      var phone = phoneSanitize(data.phoneNumber, data.phoneLocation)
      if (phone == null) {
        throw new Error('Phone country does not match with phone number');
      }

      var company = null;
      if (data.company) {
        company = {
          name: capitalize(trim(data.company.name), true),
          cif: data.company.cif.toUpperCase(),
          address: data.company.address,
          postalCode: data.company.postalCode.toUpperCase(),
          city: capitalize(trim(data.company.city), true),
          region: capitalize(trim(data.company.region), true),
          country: data.company.country.toUpperCase()
        };
      }

      return {
        name: capitalize(trim(data.name), true),
        lastName: capitalize(trim(data.lastName), true),
        nationality: data.nationality.toUpperCase(),
        nationalId: data.nationalId.toUpperCase(),
        nationalIdType: !/^[XxYyZz]/.test(data.nationalId) ? 'national' : 'foreign',
        phone: phone,
        address: data.address,
        postalCode: data.postalCode.toUpperCase(),
        city: capitalize(trim(data.city), true),
        region: capitalize(trim(data.region), true),
        country: data.country.toUpperCase(),
        userType: data.isCompany ? 'company' : 'person',
        investorType: data.naturalUser ? 'natural' : 'accredited',
        company: company
      }
    }
  },
  'updateUserDetails': {
    isQuery: false,
    sanitize: function(data) {
      var result = {};
      if (data.phoneNumber && data.phoneLocation) {
        var phone = phoneSanitize(data.phoneNumber, data.phoneLocation)
        if (phone == null) {
          throw new Error('Phone country does not match with phone number');
        }
        result.phone = phone;
      }

      if (data.company) {
        var company = {};
        if (data.company.name) company.name = capitalize(trim(data.company.name), true);
        if (data.company.cif) company.cif = data.company.cif.toUpperCase();
        if (data.company.address) company.address = data.company.address;
        if (data.company.postalCode) company.postalCode = data.company.postalCode.toUpperCase();
        if (data.company.city) company.city = capitalize(trim(data.company.city), true);
        if (data.company.region) company.region = capitalize(trim(data.company.region), true);
        if (data.company.country) company.country = data.company.country.toUpperCase();
        result.company = company;
      }

      if (data.name) result.name = capitalize(trim(data.name), true);
      if (data.lastName) result.lastName = capitalize(trim(data.lastName), true);
      if (data.nationality) result.nationality = data.nationality.toUpperCase();
      if (data.nationalId) {
        result.nationalId = data.nationalId.toUpperCase();
        result.nationalIdType = !/^[XxYyZz]/.test(data.nationalId) ? 'national' : 'foreign';
      }
      if (data.address) result.address = data.address;
      if (data.postalCode) result.postalCode = data.postalCode.toUpperCase();
      if (data.city) result.city = capitalize(trim(data.city), true);
      if (data.region) result.region = capitalize(trim(data.region), true);
      if (data.country) result.country = data.country.toUpperCase();

      return result;
    }
  },
  'showComments': {
    isQuery: true,
    sanitize: function(data) {
      return {
        projectId: data.projectId.toLowerCase(),
        page: Number(data.page)
      }
    }
  },
  'newComment': {
    isQuery: false,
    sanitize: function(data) {
      var text = data.text;
      text = text.replace(/&gt;/gi, '>');
      text = text.replace(/&lt;/gi, '<');
      text = text.replace(/(&copy;|&quot;|&amp;)/gi, '');
      text = sanitizer(text, {allowedTags: []});
      if (text.length < 1) {
        throw new Error("Comment text sanitazion error\n" + data.text);
      }
      return {
        projectId: data.projectId.toLowerCase(),
        text: text,
        threadId: data.threadId
      }
    }
  }
}

function capitalize(input, lower) {
  return (lower ? input.toLowerCase() : input).replace(/(?:^|\s|')\S/g, function(a) { return a.toUpperCase(); });
};

function trim(input) {
  return input.trim().replace(/\s+/g,' ');
}

function phoneSanitize(inputNumber, inputLocation) {
  var phoneNumber = phoneUtil.parse(inputNumber, inputLocation);

  if (phoneNumber.getCountryCode() !=
      phoneUtil.getMetadataForRegion(inputLocation).getCountryCode()) {
    return null;
  }

  return {
    number: phoneNumber.getNationalNumber(),
    isMobile: phoneUtil.getNumberType(phoneNumber) == phoneType.MOBILE,
    country: inputLocation.toUpperCase(),
    e164: phoneUtil.format(phoneNumber, phoneFormat.E164).slice(1)
  };
}
