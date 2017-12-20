const fs = require('fs');
const rmisjs = require('rmisjs');
const connect = require('rmisjs/composer/mongo/connect');
const refbooks = require('refbooks');

const getRefbook = (code, ids, rb) =>
    rb.getRefbook({
        code: 'MDP365',
        version: '1.0',
        part: '1'
    })
    .then(r =>
        r.data.map(i => {
            return {
                code: i[ids[0]].value,
                name: i[ids[1]].value
            }
        })
    )
    .catch(e => {
        console.error(e);
        return e;
    })

const getDetailedLocations = async(composer, rb) => {
    let mdp365 = await getRefbook('MDP365', [1, 3], rb);
    let c33001 = await getRefbook('C33001', [2, 3], rb);
    return await composer.getDetailedLocations(mdp365, c33001);
};

const logErrors = (logs = []) => {
    for (let log of logs) console.error(log);
}

const update = async s => {
    try {
        const composer = rmisjs(s).composer;
        console.log('RMIS -> MongoDB');
        await connect(s, async () => {
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
        console.log('MongoDB -> detailedLocations...');
        let detailed = await getDetailedLocations(composer, refbooks(s));
        console.log('detailedLocations -> ER14');
        console.log('\tdepartments...');
        logErrors(await composer.syncDepartments(detailed));
        console.log('\temployees...');
        logErrors(await composer.syncEmployees(detailed));
        console.log('\trooms...');
        logErrors(await composer.syncRooms(detailed));
        console.log('\tdeleteSchedules...');
        logErrors(await composer.deleteSchedules());
        console.log('\tschedules...');
        logErrors(await composer.syncSchedules(detailed));
        console.log('Finished');
    } catch (e) {
        console.error(e);
    }
};

module.exports = s => {
    update(s);
    setInterval(() => update(s), s.timeout);
};
