const dbService = require('feathers-rethinkdb');

module.exports = async function createUsersService(app, dbPromise) {
  app.use(
    'private/users',
    dbService({ Model: await dbPromise, name: 'users' })
  );
};
