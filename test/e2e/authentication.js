const tape = require('tape');
const fetch = require('node-fetch');

function postAuthenticate({ authorization }) {
    const raw = fetch('http://localhost:3000/authenticate', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${authorization}`,
        },
    });

    const json = raw.then(response => {
        return response.json();
    });

    return { raw, json };
}

tape('generates a jwt when given a valid google token', test => {
    test.plan(2);

    const { raw, json } = postAuthenticate({ authorization: 'googletoken'});

    raw.then(response => test.ok(response, 'sends ok status code'));

    json.then(response => {
        test.ok(response.token, 'sends a jwt');
        test.end();
    });
});

tape('does not generate a valid jwt if given an invalid google token', test => {
    test.plan(2);

    const { raw, json } = postAuthenticate({ authorization: ':('});

    raw.then(response => test.ok(response, 'sends ok status code'));

    json.then(response => {
        test.notOk(response.token, 'does not generate a jwt');
        test.end();
    });
});
