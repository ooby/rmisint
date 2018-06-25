const rmisjs = require('rmisjs');
const refbooks = require('rmisjs/composer/libs/refbook');

module.exports = async s => {
    const { composer } = rmisjs(s);
    const rb = refbooks(s);
    const ignore = [].concat(s.ignoreLog).filter(i => !!i);

    const getRefbook = async (code, indexes) => {
        const d = await rb;
        return await d.mappedNSI({
            code,
            indexes,
            version: '1.0'
        });
    };

    const dicts = Promise.all([
        getRefbook('MDP365', [1, 3]),
        getRefbook('C33001', [2, 3])
    ]);

    const getDetailedLocations = async () => {
        let d = await dicts;
        return await composer.getDetailedLocations(...d);
    };

    const logErrors = (logs = []) =>
        Array.from(logs).filter(i => {
            try {
                for (let term of ignore) {
                    if (i.ErrorText.indexOf(term) > -1) {
                        return false;
                    }
                }
                return true;
            } catch (e) {
                return false;
            }
        }).forEach(console.log);

    const logWrap = async (event, cb) => {
        console.log(`\tstart\t${event}`);
        let data = await cb();
        console.log(`\tstop\t${event}`);
        return data;
    };

    const update = async () => {
        try {
            console.log('Sync started');
            await logWrap('Departments', () => composer.mongoDepartments());
            await logWrap('Locations', () => composer.mongoLocations());
            let services = logWrap('Services', () => composer.mongoServices());
            await Promise.all([
                logWrap('Rooms', () => composer.mongoRooms()),
                logWrap('Employees', () => composer.mongoEmployees()),
                logWrap('Timeslots', () => composer.mongoTimeSlots())
            ]);
            let cachegen = logWrap('AppCache', () => composer.mongoAppCache());
            await services;
            let detailed = await logWrap('Details', () => getDetailedLocations());
            logErrors(await logWrap('Department ER14', () => composer.syncDepartments(detailed)));
            logErrors(await logWrap('Employees ER14', () => composer.syncEmployees(detailed)));
            logErrors(await logWrap('Rooms ER14', () => composer.syncRooms(detailed)));
            logErrors(await logWrap('Delete schedule ER14', () => composer.deleteSchedules()));
            logErrors(await logWrap('Add schedule ER14', () => composer.syncSchedules(detailed)));
            await cachegen;
            console.log('Sync finished');
        } catch (e) {
            console.error(e);
        }
    };

    update();
    setInterval(() => update(), s.timeout);
};
