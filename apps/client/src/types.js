// @flow
export type User = {
  google?: mixed,
  googleId?: string,
  id: string,
  name: string
};

export type Game = {};

export type State = {
  app: {
    loggedIn: boolean,
    user: ?User
  },
  errors: Array<string>,
  friends: Array<User>,
  users: Array<User>,
  games: Array<Game>
};

export type Actions = {
  getUsers: () => void,
  addFriend: (id: string) => void,
  removeFriend: (id: string) => void
};
