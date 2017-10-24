const config = require('config');
const dbService = require('feathers-rethinkdb');
const hooks = require('feathers-hooks-common');

const ENDPOINT = `/${config.api}/token`;

module.exports = function(app, dbPromise) {
    return dbPromise.then(r => {
        app.use(ENDPOINT, dbService({Model: r, name: 'token'}));

        app.service(ENDPOINT).before({
            all: hooks.disallow('external')
        });
    });
};