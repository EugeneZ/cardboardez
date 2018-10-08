module.exports = {
  definitions: {
    'users list': {
      $ref: '#/definitions/users'
    },
    users: {
      type: 'object',
      required: ['text'],
      properties: {
        id: {
          type: 'string'
        },
        name: {
          type: 'string'
        }
      }
    }
  }
};
