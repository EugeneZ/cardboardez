// @flow
import polyfill from 'babel-polyfill'; // eslint-disable-line no-unused-vars
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import mapValues from 'lodash/fp/mapValues';
import Container from './component/Container';
import { createAuthorizedFetch } from './util/fetch';
import type { State, User, Actions } from './types';
import { getUsers, addFriend, removeFriend } from './services';

async function asyncRender(el, root) {
  return new Promise(resolve => {
    render(el, root, resolve);
  });
}

const actionMap = {
  getUsers,
  addFriend,
  removeFriend
};

function getRoot() {
  return document.getElementById('react');
}

async function runApp(state: State, actions) {
  const root = getRoot();
  if (!root) {
    throw new Error('Missing root element');
  }

  return asyncRender(
    <Container
      // eslint-disable-next-line no-use-before-define
      onLoggedIn={response => handleLoggedIn(state, response)}
      // eslint-disable-next-line no-use-before-define
      onRequestLogOut={() => handleRequestLogOut(state)}
      state={state}
      actions={actions}
    />,
    root
  );
}

async function setState(state: State, actions) {
  return runApp(state, actions);
}

function handleLoggedIn(state: State, response: { user: User, token: string }) {
  const { user, token } = response;
  const fetch = createAuthorizedFetch(token);
  const newState = { ...state, app: { user, loggedIn: true } };
  const actions: Actions = mapValues(action => () =>
    action(fetch, state).then(updatedState => setState(updatedState, actions))
  )(actionMap);

  setState(newState, actions);

  actions.getUsers();
}

function makeUnauthenticatedActions(state: State) {
  const newState = {
    ...state,
    errors: state.errors.concat('You must be logged in to do that.')
  };
  const actions = mapValues(() => () => setState(newState, actions))(actionMap);
  return actions;
}

function handleRequestLogOut(state: State) {
  const newState = {
    ...state,
    app: {
      user: null,
      loggedIn: false
    }
  };

  setState(newState, makeUnauthenticatedActions(newState));
}

const initialState = {
  app: {
    loggedIn: false,
    user: null
  },
  errors: [],
  users: [],
  friends: [],
  games: []
};

runApp(initialState, makeUnauthenticatedActions(initialState));

// $FlowFixMe
if (module.hot) {
  module.hot.dispose(() => {
    unmountComponentAtNode(getRoot());
  });
}
