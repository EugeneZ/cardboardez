import { createSelector } from 'reselect';
import clone from 'lodash/clone';
import isPlainObject from 'lodash/isPlainObject';

function getGameWithRelationships(game, state) {
    if (!game || !isPlainObject(game)) {
        return game;
    }

    const clonedGame = clone(game);

    // attach player's names
    if (state.users && state.users.length && game._players && game._players.length) {
        clonedGame._players = game._players.map(player => {
            if (!player || !player.id || player.name || !isPlainObject(player)) {
                return player;
            }

            const user = state.users.find(user => user.id === player.id);

            if (user && user.name) {
                return { ...clone(player), name: user.name };
            } else {
                return player;
            }
        });
    }

    return clonedGame;
}

export const getCurrentGame = createSelector(
    state => state.games,
    (state, props) => props.params.id,
    state => state.users,

    (games, gameId, users) => getGameWithRelationships(games.find(game => game.id === gameId), { users })
);

export const getCurrentPlayerFromCurrentGame = createSelector(
    getCurrentGame,
    state => state.user,

    (currentGame, user) => currentGame && currentGame._players && user && user.id && currentGame._players.find(player => player.id === user.id)
);

export const getNewGames = createSelector(
    state => state.games,
    (state, props) => props.params && props.params.id,

    (games, currentGameId) => games.filter(game => game.createdRealtime && !game.createdByMe && game.id !== currentGameId)
);
