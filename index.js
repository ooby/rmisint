const config = require('./config').get();
const scheduler = require('./scheduler');
const rmisjs = require('rmisjs');

if (config.timezone) process.env.TZ = config.timezone

rmisjs(config)
    .composer
    .mongoConnect()
    .then(() => scheduler(config));
