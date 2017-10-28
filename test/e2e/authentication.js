const tape = require('tape');
const fetch = require('node-fetch');

tape('generates a valid jwt when given a valid google token', test => {
    test.plan(2);
    fetch('http://localhost:3000/authenticate', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: 'Bearer validtoken',
        },
    }).then(response => {
        test.ok(response);
        return response.json();
    }).then(response => {
        test.ok(response.token);
        test.end();
    });
});