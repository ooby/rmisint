const nconf = require('nconf')
const path = require('path')

module.exports = nconf
    .argv()
    .env()
    .file(path.resolve(__dirname, './config.json'))
    .defaults({
        sources: ['MIS'],
        timeout: 900000,
        rmis: {
            allowedServices: [
                'appointment-ws/appointment',
                'employees-ws/service',
                'departments-ws/departments',
                'individuals-ws/individuals',
                'locations-ws/resources',
                'services-ws/services',
                'patients-ws/patient',
                'refbooks-ws/refbooksWS',
                'rooms-ws/rooms'
            ]
        },
        mongo: {
            options: {
                reconnectTries: Number.MAX_VALUE,
                reconnectInterval: 1000,
                autoReconnect: true,
                socketTimeoutMS: 10000,
                keepAlive: true,
                autoIndex: false,
                useNewUrlParser: true
            }
        },
        ignoreLog: ['Поле СНИЛС не заполнено']
    })
