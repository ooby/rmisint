const rmisjs = require('rmisjs');
const config = require('./config').get('config');
const { composer } = rmisjs(config);

const main = async () => {
    await composer.mongoConnect();
    await composer.syncEmk();
    await composer.mongoDisconnect();
};

main();
