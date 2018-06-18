// @flow
const checkAndJSON = res => (res.ok ? res.json() : Promise.reject(res));

export async function addFriend(fetch, state, id) {
  return fetch('/api/friends', { method: 'PUT', body: id })
    .then(checkAndJSON)
    .then(friends => ({
      ...state,
      friends
    }));
}

export async function removeFriend(fetch, state, id) {
  return fetch('/api/friends', { method: 'DELETE', body: id })
    .then(checkAndJSON)
    .then(friends => ({
      ...state,
      friends
    }));
}
