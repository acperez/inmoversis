var path = require('path');
var config = module.exports = {};

/* Application ports */
config.site_port = 8888;
config.admin_port = 7777;
config.payment_port = 6666;

/* Urls */
config.payment_url = 'http://localhost'

/* LemonWay*/
config.lemonway_url = 'https://ws.lemonway.fr/mb/demo/dev/directkitjson/service.asmx';
config.lemonway_login = 'society';
config.lemonway_password = '123456';
config.lemonway_language = 'en';
config.lemonway_version = '1.1';

/* MongoDB*/
config.db_url = 'mongodb://localhost:33333/test';

/* Session */
config.session_site_path = '/';
config.session_admin_path = '/admin';
config.session_secret = '3c52e4da-5c41-11e5-84ed-bb0b844390fe';
config.session_timeout = 15 * 60 * 1000; // 30 minutes

config.test = __dirname;

/* Redis */
config.redis_host = 'localhost';
config.redis_port = 6379;
config.redis_pass = '12345678';

/* Rabbit */
config.rabbit_server  = 'amqp://dev:07def0127d29464dae47d35bded60185@localhost'
config.queue_payment = {
	name: 'payment_queue',
	durable: true,
	noAck: false
}

/* Resources */
config.default_preview_path = './public/default_preview.jpg';
config.default_preview_target = 'default_preview.jpg';

config.imagesFolder = 'images';
config.photosFolder = 'photos';
config.docsFolder = 'documents';

/* Image default sizes */
config.imageWidth = 500;
config.imageHeight = 380;

config.previewWidth = 256;
config.previewHeight = 200;

config.photoWidth = 300;
config.photoHeight = 225;

/* Comments */
config.pageComments = 10;
config.userId = '000000000000';
config.userName = 'Inmoversis';

/* Upload limit for user documents */
config.siteUploadMaxSize = 4 * 1024 * 1024; // Nginx limit should be set to the same value
config.paymentUploadMaxSize = '15mb';

/* Validator data */
config.countryFileUrl = 'https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json';
config.countryFilename = 'countries.js';

config.libphonenumberPath = path.join('node_modules', 'google-libphonenumber', 'dist', 'browser', 'libphonenumber.min.js');

/************************************************************************************/

config.resources_path = path.resolve(__dirname, '..', '..', '..', 'www');

config.adminPath = path.join(config.resources_path, 'private', 'admin');
config.sitePath = path.join(config.resources_path, 'private', 'site');
config.publicPath = path.join(config.resources_path, 'public');


config.adminProjectsPath = path.join(config.adminPath, 'projects');
config.adminUploadPath = path.join(config.adminPath, 'uploads');
config.adminBackupsPath = path.join(config.adminPath, 'backups');
config.adminProjectsBackupsPath = path.join(config.adminBackupsPath, 'projects');
config.adminUsersBackupsPath = path.join(config.adminBackupsPath, 'users');

config.siteProjectsPath = path.join(config.sitePath, 'projects');
config.siteUploadPath = path.join(config.sitePath, 'uploads');

config.publicStaticPath = path.join(config.publicPath, 'static');

config.defaultPreviewPath = path.join(config.adminPath, 'static', 'images', 'default_preview.jpg');
config.defaultPreviewTarget = 'default_preview.jpg';

config.adminTemplatesPath = path.join(config.adminPath, 'templates');

config.publicJsPath = path.join(config.publicPath, 'js');
