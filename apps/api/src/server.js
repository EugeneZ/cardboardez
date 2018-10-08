const config = require('config');
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const compression = require('compression');
const authentication = require('./services/authentication');
const services = require('./services');
const db = require('./db');
const cors = require('cors');

const app = express(feathers());

const dbPromise = db();

app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.configure(express.rest());
app.configure(socketio());
app.configure(authentication());

const servicesPromise = services(app, dbPromise);

app.use(express.notFound());
app.use(express.errorHandler());

const serverPromise = Promise.all([dbPromise, servicesPromise]).then(
  () =>
    new Promise((resolve, reject) => {
      try {
        const server = app.listen(config.port, () => resolve(server));
      } catch (err) {
        reject(err);
      }
    }),
  err => console.error('Failed to start: ', err) // eslint-disable-line no-console
);

module.exports = {
  app,
  serverPromise
};
