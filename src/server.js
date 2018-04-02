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
const cors = require('cors');

const app = feathers();

const dbPromise = db();

app.use(cors());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(feathers.static('public'));

app.configure(hooks());
app.configure(rest());
app.configure(socketio());
app.configure(authentication());

const servicesPromise = services(app, dbPromise);

app.use(errorHandler());

const serverPromise = Promise.all([dbPromise, servicesPromise]).then(
    () => new Promise((resolve, reject)=> {
        try {
            const server = app.listen(config.port, () => resolve(server));
        } catch (err) {
            reject(err);
        }
    }),
    err => console.log('Failed to start: ', err)
);

module.exports = {
    app,
    serverPromise
};