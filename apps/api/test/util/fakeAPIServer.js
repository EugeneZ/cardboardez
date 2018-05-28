const feathers = require('feathers');

const googleId = id => 'testgoogleid' + id;

function authorizationMiddleware(req, res, next) {
  const authorizationHeader = req.get('Authorization');

  if (authorizationHeader) {
    req.query.token = authorizationHeader.replace('Bearer ', '');
  }
  next();
}

function tokeninfo({ query: { access_token } }, res, next) {
  if (access_token && access_token.indexOf('googletoken') === 0) {
    const injectedData = access_token.replace('googletoken', '').trim();
    res.json({ sub: googleId(injectedData) });
  } else {
    res.json({ error_description: 'Invalid Value' });
  }
  next();
}

function googleProfile({ query: { token } }, res, next) {
  if (token && token.indexOf('googletoken') === 0) {
    const injectedData = token.replace('googletoken', '').trim();
    const override = injectedData ? JSON.parse(injectedData) : {};
    res.json(
      Object.assign(
        {
          accessToken: '123',
          displayName: 'Test User',
          emails: [
            {
              type: 'account',
              value: 'eugenezar@gmail.com'
            }
          ],
          id: googleId(injectedData),
          image: {
            isDefault: false,
            url:
              'https://lh6.googleusercontent.com/-uVqdSP_RK7U/AAAAAAAAAAI/AAAAAAAAAng/zEFsrxVCrW4/photo.jpg?sz=50'
          },
          language: 'en',
          name: {
            familyName: 'User',
            givenName: 'Test'
          },
          url: 'https://plus.google.com/102218594542013439067',
          verified: false
        },
        override
      )
    );
  } else {
    res.json({
      error: {
        errors: [
          {
            domain: 'global',
            reason: 'authError',
            message: 'Invalid Credentials',
            locationType: 'header',
            location: 'Authorization'
          }
        ],
        code: 401,
        message: 'Invalid Credentials'
      }
    });
  }
  next();
}

function newServer() {
  return new Promise((resolve, reject) => {
    try {
      const server = feathers()
        .use(authorizationMiddleware)
        .get('/tokeninfo', tokeninfo)
        .get('/profile/google', googleProfile)
        .listen(3001, () => resolve(server));
    } catch (err) {
      reject(err);
    }
  });
}

module.exports.newServer = newServer;
