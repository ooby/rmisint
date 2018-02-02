const rmisjs = require('rmisjs');
const config = require('./config').get('config');

async function main() {
    const composer = rmisjs(config).composer;
    await composer.syncEmk();
};

main();
