// @flow
import React, { PureComponent } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import mapValues from 'lodash/fp/mapValues';
import Authentication from './Authentication';
import type { User, Fetch, State } from '../types';
import App from './App';
import { createAuthorizedFetch } from '../util/fetch';
import ManageFriends from './ManageFriends';
import { addFriend, removeFriend } from '../services';

export const OAUTH2_PATH = '/oauth2';

const actionMap = {
  addFriend,
  removeFriend
};

type CState = {
  user: ?User,
  fetch: ?Fetch<any>,
  state: State
};

export default class Container extends PureComponent<{}, CState> {
  constructor(props) {
    super(props);

    this.actions = mapValues(action => () =>
      action(this.state.fetch, this.state.state).then(state =>
        this.setState({ state })
      )
    )(actionMap);
  }

  state = {
    user: null,
    fetch: null,
    state: {
      users: [],
      friends: [],
      games: []
    }
  };

  handleLoggedIn = (response: { user: User, token: string }) => {
    const { user, token } = response;
    const fetch = createAuthorizedFetch(token);
    this.setState({ user, fetch });
  };

  handleRequestLogout = () => this.setState({ user: null, fetch: null });

  render() {
    const { user, fetch } = this.state;
    const { actions } = this;

    return (
      <BrowserRouter>
        <Route path="/oauth2">
          {({ history }) => (
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
                      path="/friends"
                      render={() => (
                        <ManageFriends
                          onAddFriend={actions.addFriend}
                          onRemoveFriend={actions.removeFriend}
                        />
                      )}
                    />
                  </Switch>
                )}
            </App>
          )}
        </Route>
      </BrowserRouter>
    );
  }
}
