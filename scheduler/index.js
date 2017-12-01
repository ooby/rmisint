const moment = require('moment');
const fs = require('fs');
const rmisjs = require('rmisjs');
const refbooks = require('refbooks');
const mongosync = require('rmisjs/composer/mongo/sync');
const collect = require('rmisjs/composer/libs/collect');

const update = async (sync, composer, rb) => {
    try {
        console.log('Syncing MongoDB with RMIS...');
        await sync();
        let rbl = await rb.getRefbook({
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
        let time = moment(Date.now()).format('HH_mm_ss_DD_MM_YYYY');
        console.log('Syncing with ER14...');
        let results = [];
        console.log('Syncing departments');
        let r = await composer.syncDepartments(locs);
        results.push(r);
        console.log('Syncing employees');
        r = await composer.syncEmployees(locs);
        results.push(r);
        console.log('Syncing departments');
        r = await composer.syncDepartments(locs);
        results.push(r);
        console.log('Syncing room');
        r = await composer.syncRooms(locs);
        results.push(r);
        console.log('Syncing schedules');
        await composer.deleteSchedules();
        r = await composer.syncSchedules(locs);
        results.push(r);
        fs.writeFileSync(`./logs/${time}.json`, JSON.stringify(results));
        console.log('sync', time);
    } catch (e) {
        console.error(e);
    }
};

module.exports = cfg => {
    const rb = refbooks(cfg);
    const composer = rmisjs(cfg).composer;
    const sync = () => mongosync(cfg);
    update(sync, composer, rb);
    setInterval(() => update(sync, composer, rb), cfg.timeout);
};
