const config = require('config');
const glob = require('glob');

const ENDPOINT = `/${config.api}/gameInfo`;

const gameDir = '../../games/';
const games = glob.sync(`${gameDir}*`).map(name => {
  const fullName = `@cardboardez/${name.replace(gameDir, '')}`;
  try {
    const gameModule = require(fullName); // eslint-disable-line global-require,import/no-dynamic-require
    if (!gameModule.getConfiguration) {
      throw new Error(`${fullName} is missing getConfiguration method`);
    }
    return gameModule;
  } catch (err) {
    throw err;
  }
});

class GameInfoService {
  async find() {
    return games.map(game => game.getConfiguration());
  }
}

module.exports = function createGameInfoService(app) {
  app.use(ENDPOINT, new GameInfoService());
  return Promise.resolve();
};
