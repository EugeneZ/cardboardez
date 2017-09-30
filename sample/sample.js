const map = require('lodash/fp/map');

module.exports = function(context) {
    // Additional inputs can be accessed by the arguments property
        context.log('Eugene is testing');
    context.log(map(arg => ({ arg }))(arguments));
};