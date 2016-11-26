const library = require('./*/client.js', { mode: 'hash', resolve: 'reduce' });

export function getPlayArea(game) {
    return library[game.game].getPlayArea();
}

export function getLibrary() {
    return Object.keys(library);
}

export function getConfiguration(game, currentOptions, currentPlayerCount) {
    return library[game].getConfiguration(currentOptions, currentPlayerCount);
}