const config = require('config');
const rethinkdbdash = require('rethinkdbdash');

require('ssl-root-cas').inject();

const cert = process.env.db_cert && Buffer.from(process.env.db_cert, 'base64');

const r = rethinkdbdash({
    servers: config.db.hosts,
    db: config.db.name,
    authKey: process.env.db_password,
    ssl: cert && { ca: cert }
});

const INITIAL_TABLES = [
    'users',
    'actions',
    'games',
    'token'
];

/**
 * Sets up the RethinkDB database and connection pool. Also creates tables, see list above.
 * @type {Promise.<TResult>} Promise that resolves when the connection is ready.
 */
module.exports = function(){
    return r.dbList()
        .contains(config.db.name)
        .do(dbExists => r.branch(dbExists, {created: 0}, r.dbCreate(config.db.name))).run()

        .then(() => {
            const promises = [];
            for(var i in INITIAL_TABLES) {
                promises.push(
                    r.db(config.db.name)
                        .tableList()
                        .contains(INITIAL_TABLES[i])
                        .do(tableExists => r.branch( tableExists, {created: 0}, r.tableCreate(INITIAL_TABLES[i])))
                        .run()
                );
            }
            return Promise.all(promises);
        })

        .then(() => r);
};