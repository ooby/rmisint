module.exports = cfg => {
    const rmisjs = require('rmisjs')(cfg);
    return {
        run: async () => {
            const composer = rmisjs.composer;
            try {
                let r = await composer.getDetailedLocations();
                return;
            } catch (e) { return e; }
        }
    };
};
