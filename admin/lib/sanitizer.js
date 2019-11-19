var log = require('inmoversis_common/logger').getLogger('admin'),
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
