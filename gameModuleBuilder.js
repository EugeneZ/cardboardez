/**
 * We need to transform the cardboardez-game-* npm packages that contain the game code. These contain three elements:
 *
 * - The package's package.json 'main' entry points at the server code that contains the game logic. This does not
 *   need to be transformed or copied or anything since we're only going to be referencing it from Node itself.
 * - The configuration information. We need this info for ALL games right away, so we will combine the
 *   <package>/configuration.js files from all packages into one. It contains the game name and options.
 * - The client code such as the <PlayArea> component that powers the interface for the game. We only need this when
 *   the player joins the game, and is already a browserify package, so we just copy it to the public dir. We get this
 *   from <package>/client/client.js
 *
 *   Finally, we also need a list of all available games so we know what modules are available to fetch.
 */
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const browserify = require('browserify');
const glob = require('glob');
const jsonfile = require('jsonfile');

const gameModulePrefix = 'cardboardez-game-';
const destDir = path.join(__dirname, 'public', 'assets', 'scripts', 'games');
const bundler = browserify();
const gamelist = [];

glob(path.join(__dirname, 'node_modules', gameModulePrefix + '*'), function (err, files) {
    if (err || !files || !files.forEach) {
        throw new Error(`Couldn't access files: ${err}`);
    }

    files.forEach(filename => {
        const gameName = filename.match(gameModulePrefix + '([a-zA-Z.-]+)')[1];
        gamelist.push(gameName);

        bundler.require(
            path.join(filename, 'configuration.js'),
            { expose: `${gameModulePrefix}${gameName}-configuration` }
        );

        mkdirp(path.join(destDir, gameName), () => {
            const sourcePath = path.join(filename, 'dist', 'client.js');
            const destPath = path.join(destDir, gameName, 'client.js');
            fs.createReadStream(sourcePath)
                .pipe(fs.createWriteStream(destPath));
        });
    });

    mkdirp(path.join(destDir), () => {
        const configPath = path.join(destDir, 'configurations.js');
        bundler.bundle().pipe(fs.createWriteStream(configPath));
    });

    jsonfile.writeFileSync(path.join(__dirname, 'gamelist.json'), gamelist);
});
