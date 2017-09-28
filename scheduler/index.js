const schedule = async cfg => {
    const fs = require('fs');
    const rb = require('refbooks')(cfg);
    const rmisjs = require('./index')(cfg);
    const rmis = rmisjs.rmis;
    const composer = rmisjs.composer;
    const er14 = rmisjs.integration.er14;
    try {
        let rbl = await rb.getRefbook({ code: 'MDP365', version: '1.0', part: '1' });
        rbl.mongoose.connection.close();
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
        fs.writeFileSync('debug.json', JSON.stringify(result));
    } catch (e) { console.error(e); }
};
const sched = cfg => {
    setTimeout(() => {
        schedule(cfg);
    }, cfg.timeout);
};
module.exports = sched;
