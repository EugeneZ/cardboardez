// @flow
export async function getUsers(fetch, state) {
  return fetch('/api/users').then(users => ({
    ...state,
    users
  }));
}

export async function addFriend(fetch, state, id) {
  return fetch('/api/friends', { method: 'PUT', body: id }).then(friends => ({
    ...state,
    friends
  }));
}

export async function removeFriend(fetch, state, id) {
  return fetch('/api/friends', { method: 'DELETE', body: id }).then(
    friends => ({
      ...state,
      friends
    })
  );
}
