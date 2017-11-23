const moment = require('moment');
const refbooks = require('refbooks');
const rmisjs = require('rmisjs');
const fs = require('fs');

const schedule = async cfg => {
    try {
        const composer = rmisjs(cfg).composer;
        let rbl = await refbooks(cfg).getRefbook({
            code: 'MDP365',
            version: '1.0',
            part: '1'
        });
        let locs = await composer.getDetailedLocations(
            rbl.data.map(i => {
                return {
                    code: i[1].value,
                    name: i[3].value
                };
            })
        );
        let result = [
            await composer.syncDepartments(locs),
            await composer.syncEmployees(locs),
            await composer.syncRooms(locs),
            await composer.syncSchedules(locs)
        ];
        let time = moment(Date.now()).format('HH_mm_ss_DD_MM_YYYY');
        let logFileName = 'logs/' + time + '.json';
        fs.writeFileSync(logFileName, JSON.stringify(result));
        console.log('sync', time);
    } catch (e) {
        console.error(e);
    }
};

const sched = cfg => {
    schedule(cfg);
    setInterval(() => schedule(cfg), cfg.timeout);
};

module.exports = sched;
