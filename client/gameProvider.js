const games = require('../gamelist.json');

export function getPlayArea(gameName) {
    return require(`cardboardez-game-${gameName}-client`).getPlayArea();
}

export function getLibrary() {
    return games.slice();
}

/**
 * The caller is responsible for ensuring that the module is available before calling.
 * @param game
 * @param currentOptions
 * @param currentPlayerCount
 * @returns {*}
 */
export function getConfiguration(gameName, currentOptions, currentPlayerCount) {
    return require(`cardboardez-game-${gameName}-configuration`).getConfiguration(currentOptions, currentPlayerCount);
}