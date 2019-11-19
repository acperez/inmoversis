var log4js = require('log4js');

function getLogger(categoryName) {
  log4js.configure({
    appenders: [
      { type: 'console' }
    ]
  });

  var logger = log4js.getLogger(categoryName);
  logger.setLevel('INFO');
  return logger;
}

module.exports.getLogger = getLogger
