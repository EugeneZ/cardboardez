const { disallow } = require('feathers-hooks-common');
const { restrictToOwner } = require('feathers-authentication-hooks');
const config = require('config');
const { authenticate, attachHeaders } = require('./authentication');

module.exports = async function createUsersService(app) {
  const userDB = () => app.service('private/users');

  class UserService {
    async find(params) {
      const users = await userDB().find();
      return users.map(({ id, name }) => ({ id, name }));
    }

    async get(userId) {
      const { id, name } = await userDB().get(userId);
      return { id, name };
    }

    create(data) {
      let name;
      const { facebook, github, google, vimeo } = data;
      if (github) {
        name = github.login;
      } else if (facebook) {
        ({ name } = facebook);
      } else if (google) {
        name = google.displayName;
      } else if (vimeo) {
        ({ name } = vimeo);
      } else {
        throw new Error('invalid provider');
      }

      return userDB().create({ ...data, name });
    }

    patch(id, data) {
      return userDB()
        .patch(id, data)
        .map(({ id, name }) => ({ id, name }));
    }
  }

  const service = new UserService();
  app.use(`${config.get('api')}/users`, attachHeaders, service);

  const users = app.service(`${config.get('api')}/users`);

  users.hooks({
    before: {
      create: [disallow('external')],
      patch: [
        authenticate(),
        restrictToOwner({ idField: 'id', ownerField: 'id' })
      ]
    }
  });
};
