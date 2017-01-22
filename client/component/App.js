import React, { Component } from 'react';
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'
import { AppBar } from 'material-ui';
import { IconButton }from 'material-ui';
import { IconMenu } from 'material-ui';
import { MenuItem } from 'material-ui';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import { browserHistory } from 'react-router';
import { currentUser } from '../selectors/users';

@connect(state => ({
    user: currentUser(state)
}))
@autobind
export default class App extends Component {
    render() {
        const { user, children } = this.props;

        return (
            <div>
                <AppBar
                    title={'CardboardEZ' + (user && user.name ? ` - ${user.name}` : '')}
                    showMenuIconButton={false}
                    iconElementRight={this.renderRightAppBarIcon()}
                />
                {children}
            </div>
        )
    }

    renderRightAppBarIcon() {
        if (!this.props.user) {
            return null;
        }

        return (
            <IconMenu iconButtonElement={<IconButton><MenuIcon/></IconButton>}
                      targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            >
                <MenuItem primaryText="Start New Game" onTouchTap={this.onClickNewGame}/>
                <MenuItem primaryText="My Games" onTouchTap={this.onClickMyGames}/>
                <MenuItem primaryText="Profile" onTouchTap={this.onClickProfile}/>
                <MenuItem primaryText="Log Out" onTouchTap={this.onClickLogout}/>
            </IconMenu>
        );
    }

    onClickLogout() {
        this.props.dispatch({ type: 'LOGOUT' });
    }

    onClickNewGame() {
        browserHistory.push({ pathname: '/new' });
    }

    onClickMyGames() {
        browserHistory.push({ pathname: '/' });
    }

    onClickProfile() {
        browserHistory.push({ pathname: '/profile' });
    }

    onSendAction(data) {
        this.props.dispatch({ type: 'GAME_ACTION', data: { id: this.props.params.id, ...data }});
    }
}