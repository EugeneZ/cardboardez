module.exports = {
  parser: 'babel-eslint',
  plugins: ['flowtype'],
  extends: ['airbnb', 'plugin:flowtype/recommended', 'prettier'],
  rules: {
    'react/jsx-filename-extension': ['off'],
    'class-methods-use-this': ['off'],
    'no-underscore-dangle': ['off']
  }
};
