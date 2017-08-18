const nconf = require('./config');
const config = nconf.get('config');
const rb = require('refbooks')(config);
const scheduler = require('./scheduler');

const run = async () => {
    try {
        let r = await rb.sync();
        await scheduler(config).run();
    } catch (e) { console.error(e); }
};

run();
