//@flow
import React, { PureComponent } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Authentication from './Authentication';
import type { User, Fetch } from '../types';
import App from './App';
import { createAuthorizedFetch, type FetchOptions } from '../util/fetch';
import Games from './Games';
import NewGame from './NewGame';

export const OAUTH2_PATH = '/oauth2';

type State = {
  user: ?User,
  fetch: ?Fetch<any>
};

export default class Container extends PureComponent<{}, State> {
  state = {
    user: null,
    fetch: null
  };

  render() {
    const { user, fetch } = this.state;

    return (
      <BrowserRouter>
        <Route path="/oauth2">
          {({ match, history }) => (
            <App
              user={user}
              onRequestLogout={this.handleRequestLogout}
              history={history}
            >
              {!user && <Authentication onLoggedIn={this.handleLoggedIn} />}
              {user &&
                fetch && (
                  <Switch>
                    <Route
                      path="/games"
                      render={() => <Games fetch={fetch} />}
                    />
                    <Route
                      path="/newgame"
                      render={() => <NewGame fetch={fetch} user={user} />}
                    />
                  </Switch>
                )}
            </App>
          )}
        </Route>
      </BrowserRouter>
    );
  }

  handleLoggedIn = ({ user, token }: { user: User, token: string }) => {
    const fetch = createAuthorizedFetch(token);
    this.setState({ user, fetch });
  };

  handleRequestLogout = () => this.setState({ user: null, fetch: null });
}
