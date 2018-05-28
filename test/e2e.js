const tape = require('tape');
const { serverPromise } = require('../src/server');
const { newServer } = require('./util/fakeAPIServer');

Promise.all([serverPromise, newServer()])
  .then(([mainServer, testServer]) => {
    require('./e2e/');
    tape.onFinish(() => {
      mainServer.close();
      testServer.close();
      process.exit();
    });
  })
  .catch(err => {
    console.log(err);
    process.exit();
  });
