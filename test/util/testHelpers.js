const fetch = require('node-fetch');
const { inspect } = require('util');

const baseURL = 'http://localhost:3000';

module.exports.authenticateRequest = function authenticateRequest({
  authorization,
  method,
  debug
}) {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${authorization}`
  };

  const raw = fetch(baseURL + '/authenticate', {
    method,
    headers
  });

  const json = raw
    .then(response => {
      debug && console.log(`${method} ${response.url} is ok? ${response.ok}`);
      return response.json();
    })
    .then(json => {
      debug && console.log(`Headers: ${inspect(headers)}`);
      debug && console.log(`Response: ${inspect(json)}`);
      return json;
    });

  return Promise.all([raw, json]);
};

module.exports.getUsers = async function getUsers() {
  return fetch(baseURL + '/users').then(response => response.json());
};

module.exports.getUser = async function getUser(id) {
  return fetch(baseURL + '/users/' + id).then(response => response.json());
};

module.exports.setupUsers = function setupUsers(users) {
  return Promise.all(
    users.map(user =>
      module.exports
        .authenticateRequest({
          authorization: `googletoken ${JSON.stringify(user)}`,
          method: 'POST'
        })
        .then(([, json]) => json.user)
    )
  );
};
