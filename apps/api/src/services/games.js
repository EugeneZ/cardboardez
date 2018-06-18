const config = require('config');
const dbService = require('feathers-rethinkdb');
const hooks = require('feathers-hooks-common');
const gameProvider = require('../gameProvider');
const { authenticate } = require('./authentication');
const _ = require('lodash');

const ENDPOINT = `/${config.api}/games`;

function cleanGameData(data, id) {
  if (!data) {
    return data;
  }

  // sometimes we are cleaning an array of games, not an individual game
  if (data && data.map && !data._players) {
    const games = data.map(game => cleanGameData(game, id));
    return games;
  }

  // We need to copy this so that we can send personalized responses, but instead of doing a deep copy we
  // will only copy the structures that we need to personalize
  const game = Object.assign({}, data);

  if (game._hidden) {
    delete game._hidden;
  }

  if (game._players && game._players.map) {
    game._players = game._players.map(player => {
      const playerCopy = Object.assign({}, player); // See above about why we shallow clone
      if (playerCopy._hidden) {
        delete playerCopy._hidden;
      }
      if (playerCopy._private && playerCopy.id !== id) {
        delete playerCopy._private;
      }
      return playerCopy;
    });
  }

  return game;
}

function createNewGameData(data) {
  const starterPlayers = _.shuffle(
    data.players.map(id => ({
      id,
      _hidden: {},
      _private: {}
    }))
  );
  const starterGame = { _hidden: {}, _players: starterPlayers };
  return Object.assign(data, starterGame);
}

module.exports = function createGamesService(app, dbPromise) {
  function updateBasedOnGameAction(hook) {
    return app
      .service(ENDPOINT)
      .get(hook.data.id)
      .then(game => {
        // check the user is a player in the game
        if (game.players.indexOf(hook.params.user.id) === -1) {
          throw new Error('Cannot update a game you are not in');
        } else {
          hook.data.user = hook.params.user; // eslint-disable-line no-param-reassign
        }

        const module = gameProvider.getGameServerModule(game);
        module[game.mode](hook.data, game);
        hook.data = game; // eslint-disable-line no-param-reassign
        hook.data.updated = new Date(); // eslint-disable-line no-param-reassign
      });
  }

  return dbPromise.then(r => {
    app.use(ENDPOINT, dbService({ Model: r, name: 'games' }));

    app.service(ENDPOINT).before(authenticate());

    app.service(ENDPOINT).before({
      /**
       * This hook removes the 'hasPlayer' query param from the client so that we can do our own manual processing
       * in the after hook. If this wasn't here, the db service would look for games with a 'hasPlayer' field with
       * this value.
       */
      find(hook) {
        const { params } = hook;
        const { query } = params;

        if (query.hasPlayer) {
          params.hasPlayer = query.hasPlayer;
          delete query.hasPlayer;
        }
      },

      create(hook) {
        const module = gameProvider.getGameServerModule(hook.data);
        module.setup(createNewGameData(hook.data));
        hook.data.updated = new Date(); // eslint-disable-line no-param-reassign
      },

      update: updateBasedOnGameAction,
      patch: hooks.disallow('external'),
      remove: hooks.disallow('external')
    });

    /**
     * If the 'hasPlayer' query param was passed in to the service, it has been moved from the query to the params
     * themselves to avoid collision with actual db queries. We now use this field to return only the relevant games.
     */
    app.service(ENDPOINT).after({
      find(hook) {
        const { hasPlayer } = hook.params;

        if (hasPlayer) {
          // eslint-disable-next-line no-param-reassign
          hook.result = hook.result.filter(
            game => game.players.indexOf(hasPlayer) !== -1
          );
        }
      }
    });

    /**
     * Only emit events about games to users who are playing that game.
     */
    app.service(ENDPOINT).filter((data, connection) => {
      if (data.players.indexOf(connection.user.id) === -1) {
        return false;
      }

      return data;
    });

    /**
     * Hide hidden information from players. This means the _hidden field on the game and all players is removed,
     * as well as the _private field for all players except the one requesting the information
     */
    app.service(ENDPOINT).hooks({
      async after(hook) {
        if (hook.params.provider) {
          hook.result = cleanGameData(hook.result, hook.params.user.id); // eslint-disable-line no-param-reassign
        }

        // Fetch player data
        const userIds = _.uniq(
          _.flattenDeep(
            hook.result.map(game => game._players.map(player => player.id))
          )
        );
        const users = await Promise.all(
          userIds.map(id => app.service('users').get(id))
        );

        // eslint-disable-next-line no-param-reassign
        hook.result = hook.result.map(game => ({
          ...game,
          _meta: {
            name: game.game,
            players: game._players.map(({ id }) => {
              const user = users.find(u => u.id === id);
              return {
                id,
                name: user ? user.name : 'Player Not Found'
              };
            })
          }
        }));

        return hook;
      }
    });

    app
      .service(ENDPOINT)
      .filter((data, connection) => cleanGameData(data, connection.user.id));
  });
};
