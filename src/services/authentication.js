const config = require('config');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const { UserEndpoint } = require('../endpoints')();

const ENDPOINT = `${config.get('api')}/authenticate`;

const secret = process.env.jwt_secret;

const validTokens = new Set();

async function validateProviderAndGetOrCreateUser(app, providerToken) {
    const { error, sub, user_id } =
        await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${providerToken}`)
            .then(response => response.json());

    if (error || (!user_id && !sub)) {
        return new Error(`Can't validate token`, error);
    }

    const id = user_id || sub;

    const existingUsers = await app.service(UserEndpoint).find({ query: { googleId: id } });
    if (existingUsers && existingUsers.length) {
        return existingUsers[0];
    }

    const profile = await fetch('https://www.googleapis.com/plus/v1/people/me', {
        Authorization: `Bearer ${providerToken}`
    }).then(response => response.json());

    return await app.service(UserEndpoint).create({
        googleId: id,
        google: profile,
    });
}

async function validateTokenAndGetUser(app, token) {
    if (!token) {
        throw new Error('No token found');
    }

    if (!validTokens.has(token)) {
        throw new Error('Invalid token: No longer have it (was it removed?)');
    }

    const { id } = jwt.verify(token, secret);

    const user = await app.service(UserEndpoint).get(id);

    if (!user) {
        throw new Error('User not found (was the user removed?)');
    }

    return user;
}

function validateHeaders(headers) {
    if (!headers || !headers.authorization) {
        throw new Error('No access token found');
    }
}

function getAccessToken(authorization) {
    return authorization.replace('Bearer ', '');
}

function attachHeaders(req, res, next) {
    const headers = req.params.headers = req.params.headers || {};
    headers.authorization = req.get('authorization');
    next();
}

module.exports = function () {
    return function () {
        const app = this;
        app.use(ENDPOINT, attachHeaders, {
            async get(id, { headers }) {
                validateHeaders(headers);

                const token = getAccessToken(headers.authorization);

                const user = await validateTokenAndGetUser(app, token);

                return {
                    token,
                    user,
                };
            },

            async create(data, { headers }) {
                validateHeaders(headers);

                const access_token = getAccessToken(headers.authorization);

                const user = await validateProviderAndGetOrCreateUser(app, access_token);

                const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1d' });

                validTokens.add(token);

                return { token, user };
            },

            async remove(id, { headers }) {
                validateHeaders(headers);

                const access_token = getAccessToken(headers.authorization);

                validTokens.delete(access_token);

                return access_token;
            }
        });
    }
};

module.exports.authenticate = function() {
    return async function(hook) {
        const app = hook.app;

        // If called internally or we are already authenticated skip
        if (!hook.params.provider || hook.params.authenticated) {
            return hook;
        }

        if (hook.type !== 'before') {
            throw new Error(`The 'authenticate' hook should only be used as a 'before' hook.`);
        }

        validateHeaders(hook.params.headers);
        const token = getAccessToken(hook.params.headers.authorization);
        const user = await validateTokenAndGetUser(app, token);

        hook.params = {
            authenticated: true,
            user,
            ...hook.params
        };

        return hook;
    }
};

module.exports.attachHeaders = attachHeaders;
