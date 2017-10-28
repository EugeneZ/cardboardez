const config = require('config');
const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const compression = require('compression');
const errorHandler = require('feathers-errors/handler');
const authentication = require('./services/authentication');
const services = require('./services');
const db = require('./db');

const app = feathers();

const dbPromise = db();
const servicesPromise = services(app, dbPromise);

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(errorHandler());
app.use(feathers.static('public'));

app.configure(hooks());
app.configure(rest());
app.configure(socketio());
app.configure(authentication());

const serverPromise = Promise.all([dbPromise, servicesPromise]).then(
    () => app.listen(config.port),
    err => console.log('Failed to start: ', err)
);

module.exports = {
    app,
    serverPromise
};