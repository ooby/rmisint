const moment = require('moment');
const schedule = async cfg => {
    const fs = require('fs');
    const rb = require('refbooks')(cfg);
    const rmisjs = require('rmisjs')(cfg);
    const rmis = rmisjs.rmis;
    const composer = rmisjs.composer;
    const er14 = rmisjs.integration.er14;
    try {
        let rbl = await rb.getRefbook({ code: 'MDP365', version: '1.0', part: '1' });
        let data = rbl.data.map(i => {
            return { code: i[1].value, name: i[3].value };
        });
        let locs = await composer.getDetailedLocations(data);
        let result = [];
        let r = await composer.syncDepartments(locs);
        result.push(r);
        r = await composer.syncEmployees(locs);
        result.push(r);
        r = await composer.syncRooms(locs);
        result.push(r);
        r = await composer.syncSchedules(locs);
        result.push(r);
        let time = moment(Date.now()).format('HH_mm_ss_DD_MM_YYYY');
        let logFileName = 'logs/' + time + '.json';
        fs.writeFileSync(logFileName, JSON.stringify(result));
        console.log('sync', time);
    } catch (e) { console.error(e); }
};
const sched = cfg => {
    setInterval(() => {
        schedule(cfg);
    }, cfg.timeout);
};
module.exports = sched;
