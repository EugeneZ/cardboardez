const config = require('config');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const { NotFound, BadRequest, GeneralError } = require('feathers-errors');

const googleConfig = {
  tokenInfoURL: config.get('authentication.google.tokenInfoURL'),
  profileURL: config.get('authentication.google.profileURL')
};

const secret = process.env.jwt_secret;

const validTokens = new Set();

async function validateProviderAndGetOrCreateUser(app, providerToken) {
  const { error, sub, user_id } = await fetch(
    `${googleConfig.tokenInfoURL}?access_token=${providerToken}`
  ).then(response => response.json());

  if (error || (!user_id && !sub)) {
    throw new NotFound(`Can't validate token`, error);
  }

  const id = user_id || sub;

  const users = app.service('users');

  const existingUsers = await users.find({ query: { googleId: id } });
  if (existingUsers && existingUsers.length) {
    return existingUsers[0];
  }

  const profile = await fetch(googleConfig.profileURL, {
    headers: { Authorization: `Bearer ${providerToken}` }
  }).then(response => response.json());

  if (!profile || !profile.id) {
    throw new Error(`Invalid google profile response`, profile.error);
  }

  return await users.create({
    googleId: id,
    google: profile
  });
}

async function validateTokenAndGetUser(app, token) {
  if (!token) {
    throw new BadRequest('No token found');
  }

  if (!validTokens.has(token)) {
    throw new NotFound('Invalid token: No longer have it (was it removed?)');
  }

  const { id } = jwt.verify(token, secret);

  const user = await app.service('users').get(id);

  if (!user) {
    throw new GeneralError('User not found (was the user removed?)');
  }

  return user;
}

function validateHeaders(headers) {
  if (!headers || !headers.authorization) {
    throw new BadRequest('No access token found');
  }
}

function getAccessToken(authorization) {
  return authorization.replace('Bearer ', '');
}

function attachHeaders(req, res, next) {
  const headers = (req.params.headers = req.params.headers || {});
  headers.authorization = req.get('authorization');
  next();
}

module.exports = function() {
  return function() {
    const app = this;

    // Checks for authentication token and decorates the application if the user is authenticated
    app.use(attachHeaders, async function(req, res, next) {
      try {
        validateHeaders(req.headers);

        const token = getAccessToken(req.headers.authorization);

        const user = await validateTokenAndGetUser(app, token);

        req.feathers.authenticated = true;
        req.feathers.user = user;

        next();
      } catch (err) {
        next();
      }
    });

    // Actual authentication services
    app.use('authenticate', attachHeaders, {
      async find({ headers }) {
        validateHeaders(headers);

        const token = getAccessToken(headers.authorization);

        const user = await validateTokenAndGetUser(app, token);

        return {
          token,
          user
        };
      },

      async create(data, { headers }) {
        validateHeaders(headers);

        const access_token = getAccessToken(headers.authorization);

        const user = await validateProviderAndGetOrCreateUser(
          app,
          access_token
        );

        const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1d' });

        validTokens.add(token);

        return { token, user };
      },

      async remove(id, { headers }) {
        validateHeaders(headers);

        const access_token = getAccessToken(headers.authorization);

        await validateTokenAndGetUser(app, access_token);

        validTokens.delete(access_token);

        return access_token;
      }
    });
  };
};

module.exports.authenticate = function() {
  return async function(hook) {
    const app = hook.app;

    // If called internally or we are already authenticated skip
    if (!hook.params.provider || hook.params.authenticated) {
      return hook;
    }

    if (hook.type !== 'before') {
      throw new Error(
        `The 'authenticate' hook should only be used as a 'before' hook.`
      );
    }

    return hook;
  };
};

module.exports.attachHeaders = attachHeaders;
