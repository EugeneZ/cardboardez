const privateServices = require('./services/private');
const games = require('./services/games');
const users = require('./services/users');
const gameInfo = require('./services/gameInfo');

/**
 * This file is a good place to organize inter-service dependencies. Use the promise to manage timing. Returns a promise
 * that resolves when the services are ready.
 * @param app - feathers app
 * @param dbPromise - a Promise that resolves after the database connection is complete for services that depend on db
 */
module.exports = function createServices(app, dbPromise) {
  return Promise.all([
    privateServices(app, dbPromise),
    games(app, dbPromise),
    users(app, dbPromise),
    gameInfo(app)
  ]);
};
