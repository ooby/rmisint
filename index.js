const nconf = require('./config');
const config = nconf.get('config');
const scheduler = require('./scheduler');
const rmisjs = require('rmisjs');

rmisjs(config)
    .composer
    .mongoConnect()
    .then(() => scheduler(config));
