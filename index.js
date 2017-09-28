const nconf = require('./config');
const config = nconf.get('config');

require('./scheduler')(config);
