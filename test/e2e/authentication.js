const tape = require('tape');
const { authenticateRequest, getUsers } = require('../util/testHelpers');

tape(
  'POST /authenticate, GET /authenticate, DELETE /authenticate: generates a jwt when given a valid google token',
  async test => {
    test.plan(12);

    const random = Math.random();

    const initialUsers = await getUsers();

    const [rawPOST, jsonPOST] = await authenticateRequest({
      authorization: 'googletoken' + random,
      method: 'POST'
    });

    const usersAfterFirstPOST = await getUsers();

    await authenticateRequest({
      authorization: 'googletoken' + random,
      method: 'POST'
    });

    const usersAfterSecondPOST = await getUsers();

    test.strictEquals(
      usersAfterFirstPOST.length,
      initialUsers.length + 1,
      'POST creates a new user the first time'
    );
    test.strictEquals(
      usersAfterSecondPOST.length,
      usersAfterFirstPOST.length,
      'POST does not create a user the second time'
    );
    test.ok(rawPOST.ok, 'POST sends ok status code');
    test.ok(jsonPOST.token, 'POST sends a jwt');
    test.ok(jsonPOST.user, 'POST sends a user');
    test.strictEquals(
      jsonPOST.user.name,
      'Test User',
      'POST sends correct user'
    );

    const [rawGET, jsonGET] = await authenticateRequest({
      authorization: jsonPOST.token
    });

    test.ok(rawGET.ok, 'GET sends ok status code');
    test.ok(jsonGET.user, 'GET sends a user');
    test.strictEquals(jsonGET.user.name, 'Test User', 'GET sends correct user');

    const [rawDELETE] = await authenticateRequest({
      authorization: jsonPOST.token,
      method: 'DELETE'
    });

    test.ok(rawDELETE.ok, 'DELETE sends ok status code');

    const [rawInvalidGET, jsonInvalidGET] = await authenticateRequest({
      authorization: jsonPOST.token,
      method: 'DELETE'
    });

    test.notOk(
      rawInvalidGET.ok,
      'GET after DELETE does not send ok status code'
    );
    test.notOk(jsonInvalidGET.user, 'GET after DELETE does not send a user');

    test.end();
  }
);

tape(
  'POST /authenticate: does not generate a valid jwt if given an invalid google token',
  test => {
    test.plan(3);

    authenticateRequest({ authorization: ':(', method: 'POST' }).then(
      ([raw, json]) => {
        test.notOk(raw.ok, 'does not send ok status code');
        test.strictEquals(raw.status, 404, 'sends 404 code');
        test.notOk(json.token, 'does not generate a jwt');
        test.end();
      }
    );
  }
);

tape('DELETE /authenticate: cannot delete invalid token', test => {
  test.plan(2);
  authenticateRequest({ authorization: 'fail', method: 'DELETE' }).then(
    ([raw, json]) => {
      test.notOk(raw.ok, 'Sends unsuccessful status code');
      test.strictEquals(raw.status, 404, 'sends 404 code');
      test.end();
    }
  );
});
