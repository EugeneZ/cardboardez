const { join } = require('path');
const jsonServer = require('json-server');
const tape = require('tape');
const { serverPromise } = require('../src/server');

const authorizationMiddleware = (req, res, next) => {
    const authorizationHeader = req.get('Authorization');

    if (authorizationHeader) {
        req.query.token = authorizationHeader.replace('Bearer ', '');
    }
    next();
};

const mainServerPromise = new Promise((resolve, reject)=> {
    serverPromise
        .then(server => {
            server.listen(3000, ()=>resolve(server));
        })
        .catch(reject);
});

const testServerPromise = new Promise((resolve, reject) => {
    try {
        const testServer = jsonServer.create()
            .use(authorizationMiddleware)
            .use(jsonServer.defaults())
            .use(jsonServer.router(join(__dirname, 'e2e.json')))
            .listen(3001, () => resolve(testServer))
    } catch (err) {
        reject(err);
    }
});

Promise.all([
    mainServerPromise,
    testServerPromise
]).then(([mainServer, testServer])=>{
    require('./e2e/');
    tape.onFinish(() => {
        mainServer.close();
        testServer.close();
        process.exit();
    });
}).catch(err => {
    console.log(err);
    process.exit();
});

