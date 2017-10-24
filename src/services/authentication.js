const authentication = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const { Strategy } = require('passport-http-bearer');
const fetch = require('node-fetch');
const { ENDPOINT } = require('./users');

module.exports = function () {
    return function () {
        this.configure(authentication({
            idField: 'id',
            secret: process.env.jwt_secret,
            service: ENDPOINT,
        }));
        this.configure(jwt());

        this.service('authentication').hooks({
            before: {
                create: [authentication.hooks.authenticate('bearer')]
            }
        });

        this.passport.use(new Strategy(async (token, done) => {
            try {
                const { error, sub, user_id, scope, expires_in } =
                    await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`)
                        .then(response => response.json());

                if (error || (!user_id && !sub)) {
                    return done(error || new Error(`Can't validate token`));
                }

                const id = user_id || sub;

                const metadata = { scope, expires_in };

                const existingUsers = await this.service(ENDPOINT).find({ query: { googleId: id } });
                if (existingUsers && existingUsers.length) {
                    return done(null, existingUsers[0], metadata);
                }

                const profile = await fetch('https://www.googleapis.com/plus/v1/people/me', {
                    Authorization: `Bearer ${token}`
                }).then(response => response.json());

                const user = await this.service(ENDPOINT).create({
                    googleId: id,
                    google: profile,
                });

                return done(null, user, metadata);
            } catch (err) {
                return done(err);
            }
        }));
    }
};