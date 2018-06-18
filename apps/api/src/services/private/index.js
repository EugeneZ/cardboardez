const hooks = require('feathers-hooks-common');
const dbService = require('feathers-rethinkdb');

const PRIVATE_PREFIX = 'private/';
const disallowExternal = hooks.disallow('external');

module.exports = async function index(app, dbPromise) {
  const db = await dbPromise;

  ['users', 'friends'].forEach(name => {
    app.use(`${PRIVATE_PREFIX}${name}`, dbService({ Model: db, name }));
  });

  app.hooks({
    before: {
      all: [
        hook => {
          if (hook.path.indexOf(PRIVATE_PREFIX) !== -1) {
            return disallowExternal(hook);
          }

          return hook;
        }
      ]
    }
  });
};
