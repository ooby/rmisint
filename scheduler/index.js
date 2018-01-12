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
            };
        })
    )
    .catch(e => {
        console.error(e);
        return e;
    });

const getDetailedLocations = async(composer, rb) => {
    let mdp365 = await getRefbook('MDP365', [1, 3], rb);
    let c33001 = await getRefbook('C33001', [2, 3], rb);
    return await composer.getDetailedLocations(mdp365, c33001);
};

const logErrors = (logs = []) => {
    for (let log of [].concat(logs)) console.error(log);
};

const update = async s => {
    try {
        const composer = rmisjs(s).composer;
        console.log('1. Caching to MongoDB');
        await connect(s, async () => {
            console.log('1.1. Departments');
            await composer.mongoDepartments();
            console.log('1.2. Locations');
            await composer.mongoLocations();
            console.log('1.3. Employees, rooms, services and timeslots');
            await Promise.all([
                composer.mongoRooms().then(() => console.log('Rooms are cached')),
                composer.mongoServices().then(() => console.log('Services are cached')),
                composer.mongoEmployees().then(() => console.log('Employees are cached')),
                composer.mongoTimeSlots().then(() => console.log('Timeslots are cached'))
            ]);
        });
        console.log('2. Getting detailed locations');
        let detailed = await getDetailedLocations(composer, refbooks(s));
        console.log('3. Sending to ER14');
        console.log('3.1. Departments');
        logErrors(await composer.syncDepartments(detailed));
        console.log('3.2. Employees');
        logErrors(await composer.syncEmployees(detailed));
        console.log('3.3. Rooms');
        logErrors(await composer.syncRooms(detailed));
        console.log('3.4. Deleting old schedule');
        logErrors(await composer.deleteSchedules());
        console.log('3.5. Adding new schedule');
        logErrors(await composer.syncSchedules(detailed));
        console.log('4. Finished');
    } catch (e) {
        console.error(e);
    }
};

const wait = async time =>
    new Promise((resolve, reject) =>
        setTimeout(() => resolve, time)
    );

module.exports = async s => {
    while (true) {
        await update(s);
        await wait(s.timeout);
    }
};
