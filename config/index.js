const nconf = require('nconf');
const path = require('path');
nconf.argv().env().file({ file: path.join(__dirname, 'config.json') });
nconf.set('config:mongo:options:reconnectTries', Infinity);
module.exports = nconf;
