import React from 'react';
import { Router, Route, browserHistory, IndexRoute } from 'react-router'
import { Provider } from 'react-redux';
import { MuiThemeProvider } from 'material-ui';
import feathers from './feathers';
import App from './component/App';
import GamesList from './component/GamesList';
import NewGame from './component/NewGame';
import Welcome from './component/Welcome';
import PlayArea from './component/PlayArea';
import Profile from './component/Profile';

function requireAuthentication(nextState, replace) {
    if (!feathers.get('user')) {
        replace({ pathname: '/login' });
    }
}

function sendToProfileIfAuthenticated(nextState, replace) {
    if (feathers.get('user')) {
        replace({ pathname: '/profile' });
    }
}

export default function (store) {
    return (
        <Provider store={store}>
            <MuiThemeProvider>
                <Router history={browserHistory}>
                    <Route path="/" component={App}>
                        <IndexRoute component={GamesList} onEnter={requireAuthentication}/>
                        <Route path="login" component={Welcome} onEnter={sendToProfileIfAuthenticated}/>
                        <Route path="new" component={NewGame} onEnter={requireAuthentication}/>
                        <Route path="game/:id" component={PlayArea} onEnter={requireAuthentication}/>
                        <Route path="profile" component={Profile} onEnter={requireAuthentication}/>
                    </Route>
                </Router>
            </MuiThemeProvider>
        </Provider>
    );
}