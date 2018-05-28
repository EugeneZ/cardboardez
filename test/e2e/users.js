const tape = require('tape');
const { getUser, getUsers, setupUsers } = require('../util/testHelpers');

const nameRichard = 'Richard Feynman';
const nameAlbert = 'Albert Einstein';

tape('GET /users', async test => {
  test.plan(2);

  await setupUsers([{ displayName: nameRichard }, { displayName: nameAlbert }]);

  const users = await getUsers();
  test.ok(Array.isArray(users), 'GET /users returns an aray');

  const richard = users.find(user => user.name === nameRichard);
  const albert = users.find(user => user.name === nameAlbert);

  if (!richard || !albert) {
    test.fail('GET /users did not return expected users');
  }

  test.notEqual(albert, richard, 'GET /users members are individuals');

  test.end();
});

tape('GET /users/:id', async test => {
  test.plan(2);

  const [richard] = await setupUsers([
    { displayName: nameRichard },
    { displayName: nameAlbert }
  ]);

  const user = await getUser(richard.id);

  test.strictEquals(
    user.id,
    richard.id,
    'GET /users/:id returns the correct id'
  );
  test.strictEquals(
    user.name,
    nameRichard,
    'GET /users/:id returns the correct name'
  );

  test.end();
});
