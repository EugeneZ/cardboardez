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
const browserify = require('browserify');
const glob = require('glob');
const jsonfile = require('jsonfile');

const gameModulePrefix = 'cardboardez-game-';
const destDir = path.join(__dirname, 'public', 'assets', 'games');
const bundler = browserify();
const gamelist = [];

const useSymlinks = process.argv.includes('--useSymlinks');

glob(path.join(__dirname, 'node_modules', gameModulePrefix + '*'), function (err, gameModules) {
    if (err || !gameModules || !gameModules.forEach) {
        throw new Error(`Couldn't access files: ${err}`);
    }

    gameModules.forEach(gameModule => {
        const distDir = path.join(gameModule, 'dist');
        const gameName = gameModule.match(gameModulePrefix + '([a-zA-Z.-]+)')[1];
        gamelist.push(gameName);

        bundler.require(
            path.join(gameModule, 'configuration.js'),
            { expose: `${gameModulePrefix}${gameName}-configuration` }
        );

        fs.mkdir(destDir, () => {

            if (useSymlinks) {
                fs.symlink(distDir, path.join(destDir, gameName), 'junction', err => {
                    if (err) {
                        throw new Error('Could not create symlink: ' + err);
                    }
                });
                return;
            }

            fs.mkdir(path.join(destDir, gameName), () => {

                fs.readdir(distDir,
                    (err, files) => {
                        if (err) {
                            throw new Error(`Can't read dist dir of module ${gameModule}: ${err}`);
                        }
                        if (!files.includes('client.js')) {
                            throw new Error(`Can't find client.js file in dist dir of module ${gameModule}`);
                        }
                        files.forEach(file => {
                            const sourcePath = path.join(distDir, file);
                            const destPath = path.join(destDir, gameName, file);
                            fs.createReadStream(sourcePath)
                                .pipe(fs.createWriteStream(destPath));
                        });
                    }
                );
            });
        });
    });

    fs.mkdir(destDir, () => {
        const configPath = path.join(destDir, 'configurations.js');
        bundler.bundle().pipe(fs.createWriteStream(configPath));
    });

    jsonfile.writeFileSync(path.join(__dirname, 'gamelist.json'), gamelist);
});
