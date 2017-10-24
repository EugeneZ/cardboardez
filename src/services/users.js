const dbService = require('feathers-rethinkdb');
const hooks = require('feathers-hooks-common');
const authHooks = require('feathers-authentication-hooks');
const { UserEndpoint } = require('../endpoints')();
const { authenticate, attachHeaders } = require('./authentication');

const ENDPOINT = UserEndpoint;

module.exports = function(app, dbPromise) {
    return dbPromise.then(r => {
        app.use(ENDPOINT, attachHeaders, dbService({Model: r, name: 'users'}));

        app.service(ENDPOINT).before({
            create: [hooks.disallow('external'), hooks.pluck('id', 'name')],
            update: [hooks.disallow('external'), hooks.pluck('id', 'name')],
            patch : [hooks.pluck('id', 'name'), authenticate(), authHooks.restrictToOwner({ idField: 'id', ownerField: 'id'})],
            remove: [hooks.disallow('external'), hooks.pluck('id', 'name')]
        });

        app.service(ENDPOINT).after({
            get     : hooks.pluck('id', 'name'),
            find    : hooks.pluck('id', 'name')
        });

        // TODO: When this bug is fixed in feathers, move this to a hook. https://github.com/feathersjs/feathers/issues/376
        app.service(ENDPOINT).filter(function(data){
            return { id: data.id, name: data.name };
        });

        app.service(ENDPOINT).before({
            create(hook) {
                const { facebook, github, google, vimeo } = hook.data;
                if (github) {
                    hook.data.name = github.login;
                } else if (facebook) {
                    hook.data.name = facebook.name;
                } else if (google) {
                    hook.data.name = google.displayName;
                } else if (vimeo) {
                    hook.data.name = vimeo.name;
                } else {
                    console.log(require('util').inspect(hook));
                }
            }
        });

    });
};

module.exports.ENDPOINT = ENDPOINT;
