//@flow
const defaults = {
  api: 'http://localhost:3000',
  auth: {
    google: {
      clientID:
        '129064672662-s8c4qh99narpl4fu77m6l683615beukf.apps.googleusercontent.com'
    }
  }
};

const production = {
  ...defaults
};

const config = process.env.NODE_ENV === 'production' ? production : defaults;

export default config;
