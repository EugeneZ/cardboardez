const dbService = require('feathers-rethinkdb');

const ENDPOINT = 'private/friends';

module.exports = async function createFriendsService(app, dbPromise) {
  app.use(ENDPOINT, dbService({ Model: await dbPromise, name: 'friends' }));
};
