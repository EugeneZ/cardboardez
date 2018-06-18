// @flow
import React, { PureComponent } from 'react';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { start, finish } from 'oauth2-implicit';
import store from 'store';
import fetch from '../util/fetch';
import { OAUTH2_PATH } from './Container';
import config from '../config';
import type { User } from '../types';

const STORE_KEY = '_authToken';

const styles = {
  container: {
    padding: '5%',
    display: 'flex',
    marginBottom: 50,
    flexWrap: 'wrap'
  },
  loginButton: {
    margin: '10px auto'
  },
  icon: {
    marginRight: 10
  }
};

const { location } = global;

const providers = [
  {
    name: 'Google',
    onClick: () =>
      start({
        auth_uri: 'https://accounts.google.com/o/oauth2/v2/auth',
        redirect_uri: `${location.protocol}//${location.host}${OAUTH2_PATH}`,
        scope: ['https://www.googleapis.com/auth/userinfo.email'],
        client_id: config.auth.google.clientID
      })
  }
];

type Props = {
  onLoggedIn: ({ token: string, user: User }) => mixed
};

type State = {
  loggedIn: boolean,
  error: ?string
};

export default class Authentication extends PureComponent<Props, State> {
  state = {
    loggedIn: false,
    error: null
  };

  componentDidMount() {
    const { accessToken } = finish() || {};
    const storedToken = store.get(STORE_KEY);

    if (accessToken) {
      this.postGoogleToken(accessToken);
    } else if (storedToken) {
      this.verifyAuthToken(storedToken);
    }
  }

  gotUserToken = (response: { user: User, token: string }) => {
    const { user, token } = response;
    this.setState({ loggedIn: true });
    store.set(STORE_KEY, token);
    this.props.onLoggedIn({ token, user });
  };

  gotError = (error: mixed) => this.setState({ error: JSON.stringify(error) });

  postGoogleToken = (accessToken: string) =>
    fetch('/authenticate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(this.gotUserToken)
      .catch(this.gotError);

  verifyAuthToken = (authToken: string) =>
    fetch('/authenticate/', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })
      .then(this.gotUserToken)
      .catch(this.gotError);

  render() {
    const { loggedIn, error } = this.state;

    if (loggedIn) {
      return null;
    }

    return (
      <div style={styles.container}>
        {error && <div>Error: {error}</div>}
        {providers.map(({ name, onClick }) => (
          <Button
            key={name}
            variant="raised"
            color="primary"
            label={`Login with ${name}`}
            style={styles.loginButton}
            onClick={onClick}
          >
            <Icon
              className={`fa fa-${name.toLowerCase()}`}
              style={styles.icon}
            />
            Login with {name}
          </Button>
        ))}
      </div>
    );
  }
}
