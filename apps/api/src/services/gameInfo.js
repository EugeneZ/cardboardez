const config = require('config');
const dbService = require('feathers-rethinkdb');
const hooks = require('feathers-hooks-common');
const gameProvider = require('../gameProvider');
const { authenticate } = require('./authentication');
const _ = require('lodash');
const glob = require('glob');

const ENDPOINT = `/${config.api}/gameInfo`;

const gameDir = '../../games/';
const games = glob.sync(gameDir + '*').map(name => {
  const fullName = `@cardboardez/${name.replace(gameDir, '')}`;
  try {
    const gameModule = require(fullName);
    if (!gameModule.getConfiguration) {
      throw new Error(`${fullName} is missing getConfiguration method`);
    }
    return gameModule;
  } catch (err) {
    console.error(
      `Can't find module for '${name}'. Folder exists but module '${fullName}' was not found (or didn't have a required method).`
    );
    throw err;
  }
});

class GameInfoService {
  async find(params) {
    return games.map(game => game.getConfiguration());
  }
}

module.exports = function(app) {
  app.use(ENDPOINT, new GameInfoService());
  return Promise.resolve();
};
