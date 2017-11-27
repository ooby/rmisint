const moment = require('moment');
const fs = require('fs');
const rmisjs = require('rmisjs');
const refbooks = require('refbooks');
const mongosync = require('rmisjs/composer/mongo/sync');

const update = async (sync, composer, rb) => {
    try {
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
        fs.writeFileSync(`./logs/${time}.json`, JSON.stringify([
            await composer.syncDepartments(locs),
            await composer.syncEmployees(locs),
            await composer.syncRooms(locs),
            await composer.syncSchedules(locs)
        ]));
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
