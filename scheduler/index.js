const fs = require('fs');
const rmisjs = require('rmisjs');
const connect = require('rmisjs/composer/mongo/connect');
const refbooks = require('refbooks');

const getDetailedLocations = async(composer, rb) => {
    let [mdp365, c33001] = await Promise.all([
        rb.getRefbook({
            code: 'MDP365',
            version: '1.0',
            part: '1'
        }).then(r =>
            r.data.map(i => {
                return {
                    code: i[1].value,
                    name: i[3].value
                }
            })
        ),
        rb.getRefbook({
            code: 'C33001',
            version: '1.0',
            part: '1'
        }).then(r =>
            r.data.map(i => {
                return {
                    code: i[2].value,
                    name: i[3].value
                }
            })
        )
    ]);
    return await composer.getDetailedLocations(mdp365, c33001);
};

const filterLogs = logs =>
    logs.filter(i =>
        !/имеется занятый слот/.test(i.ErrorText) &&
        i.ErrorCode !== 0
    );

const update = async cfg => {
    try {
        const composer = rmisjs(cfg).composer;
        console.log('RMIS -> MongoDB');
        await connect(cfg, async () => {
            console.log('\tdepartments...');
            await composer.mongoDepartments();
            console.log('\tlocations...');
            await composer.mongoLocations();
            console.log('\temployees, rooms, services and timeslots...');
            await Promise.all([
                composer.mongoEmployees(),
                composer.mongoRooms(),
                composer.mongoServices(),
                composer.mongoTimeSlots()
            ]);
        });
        console.log('MongoDB -> detailedLocations...')
        let detailed = await getDetailedLocations(composer, refbooks(cfg));
        let logs = [];
        console.log('detailedLocations -> ER14\n\tdepartments...')
        logs = logs.concat(await composer.syncDepartments(detailed));
        console.log('\temployees...');
        logs = logs.concat(await composer.syncEmployees(detailed));
        console.log('\trooms...');
        logs = logs.concat(await composer.syncRooms(detailed));
        console.log('\tdeleteSchedules...');
        logs = logs.concat(await composer.deleteSchedules(-1, 31));
        console.log('\tschedules...');
        logs = logs.concat(await composer.syncSchedules(detailed));
        console.log('Finished');
        for (let error of filterLogs(logs)) console.error(error);
    } catch (e) {
        console.error(e);
    }
};

module.exports = cfg => {
    let last = update(cfg);
    setInterval(async() => {
        await last;
        last = update(cfg)
    }, cfg.timeout);
};
