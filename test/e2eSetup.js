const { join } = require('path');
const jsonServer = require('json-server');
const tape = require('tape');

const main = require('../src/server');

const authorizationMiddleware = (req, res, next) => {
    const authorizationHeader = req.get('Authorization');

    if (authorizationHeader) {
        req.query.token = authorizationHeader.replace('Bearer ', '');
    }
    next();
};

const testServer = jsonServer.create()
    .use(authorizationMiddleware)
    .use(jsonServer.defaults())
    .use(jsonServer.router(join(__dirname, 'e2e.json')))
    .listen(3001, () => null);

tape.onFinish(()=>{
    setTimeout(()=>{
        testServer.close();
        main.serverPromise.then(server => server.close());
        process.exit();
    },2000);
});
