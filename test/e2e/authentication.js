const tape = require('tape');
const fetch = require('node-fetch');
const { inspect } = require('util');

function authenticateRequest({ authorization, method }) {
    const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${authorization}`,
    };

    const raw = fetch('http://localhost:3000/authenticate', {
        method,
        headers,
    });

    const json = raw.then(response => {
        console.log(`${method} ${response.url} is ok? ${response.ok}`);
        return response.json();
    }).then(json => {
        console.log(`Response: ${inspect(json)}`);
        console.log(`Headers: ${inspect(headers)}`);
        return json;
    });

    return Promise.all([ raw, json ]);
}

tape('POST /authenticate: generates a jwt when given a valid google token', test => {
    test.plan(2);

    authenticateRequest({ authorization: 'googletoken', method: 'POST' })
        .then(([raw, json])=>{
            test.ok(raw.ok, 'sends ok status code');
            test.ok(json.token, 'sends a jwt');
            test.end();
        });
});

tape('POST /authenticate: does not generate a valid jwt if given an invalid google token', test => {
    test.plan(3);

    authenticateRequest({ authorization: ':(', method: 'POST' })
        .then(([raw, json])=>{
            test.notOk(raw.ok, 'does not send ok status code');
            test.strictEquals(raw.status, 404, 'sends 404 code');
            test.notOk(json.token, 'does not generate a jwt');
            test.end();
        });
});

tape('DELETE /authenticate: cannot delete invalid token', test => {
    test.plan(2);
    authenticateRequest({ authorization: 'fail', method: 'DELETE'})
        .then(([raw, json])=>{
            test.notOk(raw.ok, 'Sends unsuccessful status code');
            test.strictEquals(raw.status, 404, 'sends 404 code');
            test.end();
        });
});
