const config = require('config');
const { restrictToOwner } = require('feathers-authentication-hooks');
const { authenticate, attachHeaders } = require('./authentication');

module.exports = function createFriendsService(app) {
  const friendDB = () => app.service('private/friends');
  const userDB = () => app.service('private/user');

  class FriendService {
    async find(params) {
      try {
        const { friends } = await friendDB().get(params.user.id);
        const users = await userDB().find({
          query: {
            id: {
              $in: friends
            }
          }
        });

        return users.map(({ id, name }) => ({
          id,
          name
        }));
      } catch (err) {
        // TODO: This should only catch the NotFound error
        return [];
      }
    }

    async update(id, data, params) {
      if (typeof id !== 'string') {
        throw new Error('no new friend id');
      }

      const { user } = params;
      try {
        const friendDoc = await friendDB().get(user.id);

        return friendDB().update(user.id, {
          ...friendDoc,
          friends: friendDoc.friends.concat(id)
        });
      } catch (err) {
        // TODO: This should only catch the NotFound error
        return friendDB().create({
          id: user.id,
          friends: [id]
        });
      }
    }

    async remove(id, params) {
      const { user } = params;
      const friendDoc = await friendDB().get(user.id);

      return friendDB().update(user.id, {
        ...friendDoc,
        friends: friendDoc.friends.filter(friendId => friendId !== id)
      });
    }
  }

  const service = new FriendService();

  service.hooks({
    before: {
      all: [authenticate()],
      update: [restrictToOwner({ idField: 'id', ownerField: 'id' })],
      remove: [restrictToOwner({ idField: 'id', ownerField: 'id' })]
    }
  });

  app.use(`${config.get('api')}/friends`, attachHeaders, service);
};
