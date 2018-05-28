const dbService = require('feathers-rethinkdb');
const { disallow, pluck } = require('feathers-hooks-common');
const { restrictToOwner } = require('feathers-authentication-hooks');
const { authenticate, attachHeaders } = require('./authentication');

module.exports = async function(app, dbPromise) {
  app.use(
    'users',
    attachHeaders,
    dbService({ Model: await dbPromise, name: 'users' })
  );

  const users = app.service('users');

  users.before({
    create: [disallow('external')],
    update: [disallow()],
    patch: [
      authenticate(),
      restrictToOwner({ idField: 'id', ownerField: 'id' }),
      pluck('id', 'name')
    ],
    remove: [disallow('external')]
  });

  users.after({
    get: pluck('id', 'name'),
    find: pluck('id', 'name')
  });

  // TODO: When this bug is fixed in feathers, move this to a hook. https://github.com/feathersjs/feathers/issues/376
  users.filter(function(data) {
    return { id: data.id, name: data.name };
  });

  users.before({
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
};
