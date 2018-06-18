// @flow
import React, { PureComponent } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Authentication from './Authentication';
import type { State, Actions, User } from '../types';
import App from './App';
import ManageFriends from './ManageFriends';

export const OAUTH2_PATH = '/oauth2';

type Props = {
  state: State,
  actions: Actions,
  onLoggedIn: ({ token: string, user: User }) => mixed,
  onRequestLogout: () => mixed
};

export default class Container extends PureComponent<Props> {
  render() {
    const { actions, state, onLoggedIn, onRequestLogout } = this.props;
    const { app, friends, users } = state;
    const { user, loggedIn } = app;

    return (
      <BrowserRouter>
        <Route>
          {({ history }) => (
            <App
              user={user}
              onRequestLogout={onRequestLogout}
              history={history}
            >
              {!loggedIn && <Authentication onLoggedIn={onLoggedIn} />}
              {user &&
                loggedIn && (
                  <Switch>
                    <Route
                      path="/friends"
                      render={() => (
                        <ManageFriends
                          friends={friends}
                          users={users}
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
