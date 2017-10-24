const config = require('config');

module.exports = function() {
    return {
        UserEndpoint: `/${config.api}/users`,
    }
};
