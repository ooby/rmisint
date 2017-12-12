const moment = require('moment');
const fs = require('fs');
const rmisjs = require('rmisjs');
const refbooks = require('refbooks');
const mongosync = require('rmisjs/composer/mongo/sync');
const collect = require('rmisjs/composer/libs/collect');

const getDetailedLocations = async(composer, rb) => {
    let mdp365 = await rb.getRefbook({
        code: 'MDP365',
        version: '1.0',
        part: '1'
    });
    mdp365 = mdp365.data.map(i => {
        return {
            code: i[1].value,
            name: i[3].value
        };
    });
    let c33001 = await rb.getRefbook({
        code: 'C33001',
        version: '1.0',
        part: '1'
    });
    c33001 = c33001.data.map(i => {
        return {
            code: i[2].value,
            name: i[3].value
        };
    });
    return await composer.getDetailedLocations(mdp365, c33001);
};

const filterLogs = logs =>
    logs.filter(i =>
        !/имеется занятый слот/.test(i.ErrorText) &&
        i.ErrorCode !== 0
    );

const update = async(sync, composer, rb) => {
    try {
        console.log('SYNC', 'RMIS->MongoDB');
        await sync();
        let detailed = await getDetailedLocations(composer, rb);
        let logs = [];
        console.log('SYNC', 'MongoDB->ER14', 'departments');
        logs = logs.concat(await composer.syncDepartments(detailed));
        console.log('SYNC', 'MongoDB->ER14', 'employees');
        logs = logs.concat(await composer.syncEmployees(detailed));
        console.log('SYNC', 'MongoDB->ER14', 'rooms');
        logs = logs.concat(await composer.syncRooms(detailed));
        console.log('SYNC', 'MongoDB->ER14', 'deleteSchedules');
        logs = logs.concat(await composer.deleteSchedules(0, 29));
        console.log('SYNC', 'MongoDB->ER14', 'schedules');
        logs = logs.concat(await composer.syncSchedules(detailed));
        logs = filterLogs(logs);
        if (logs.length === 0) console.log('Finished');
        else for (let error of logs) console.error(error);
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
