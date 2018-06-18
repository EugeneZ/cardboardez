const config = require('config');
const rethinkdbdash = require('rethinkdbdash');

const cert = process.env.db_cert && Buffer.from(process.env.db_cert, 'base64');

const db = rethinkdbdash({
  servers: config.db.hosts,
  db: config.db.name,
  authKey: process.env.db_password,
  ssl: cert && { ca: cert }
});

const INITIAL_TABLES = ['users', 'actions', 'games', 'friends'];

/**
 * Sets up the RethinkDB database and connection pool. Also creates tables, see list above.
 * @type {Promise.<TResult>} Promise that resolves when the connection is ready.
 */
module.exports = function createDb() {
  return db
    .dbList()
    .contains(config.db.name)
    .do(dbExists =>
      db.branch(dbExists, { created: 0 }, db.dbCreate(config.db.name))
    )
    .run()

    .then(() => {
      const promises = [];
      INITIAL_TABLES.forEach(table => {
        promises.push(
          db
            .db(config.db.name)
            .tableList()
            .contains(table)
            .do(tableExists =>
              db.branch(tableExists, { created: 0 }, db.tableCreate(table))
            )
            .run()
        );
      });

      return Promise.all(promises);
    })

    .then(() => db);
};
