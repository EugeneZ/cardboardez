//@flow
export type Fetch<T> = (url: string, options?: FetchOptions) => Promise<T>;

export type User = {
  google?: mixed,
  googleId?: string,
  id: string,
  name: string
};

export type Game = {};

export type State = {
  friends: Array<User>,
  users: Array<User>,
  games: Array<Game>
};
