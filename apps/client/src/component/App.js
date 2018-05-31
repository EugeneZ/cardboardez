//@flow
import React, { PureComponent, type Node } from 'react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import Menu from 'material-ui/Menu/Menu';
import { MenuItem } from 'material-ui/Menu';
import type { User } from '../types';
import type { RouterHistory } from 'react-router-dom';

type Props = {
  children: Node,
  user: ?User,
  onRequestLogout: () => mixed,
  history: RouterHistory
};

type State = {
  menuEl: ?HTMLElement
};

export default class App extends PureComponent<Props, State> {
  state = {
    menuEl: null
  };

  render() {
    const { user, children, onRequestLogout, history } = this.props;
    const { menuEl } = this.state;

    return (
      <div>
        <AppBar>
          <Toolbar>
            <Typography variant="title" color="inherit" style={{ flex: 1 }}>
              CardboardEZ {user && user.name && ` - ${user.name}`}
            </Typography>
            {user && (
              <div>
                <IconButton
                  aria-owns={open ? 'menu-appbar' : null}
                  aria-haspopup="true"
                  onClick={this.handleMenu}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={menuEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  open={!!menuEl}
                  onClose={this.handleClose}
                >
                  <MenuItem onClick={() => this.handleNavigate('/new')}>
                    Start New Game
                  </MenuItem>
                  <MenuItem onClick={() => this.handleNavigate('/games')}>
                    My Games
                  </MenuItem>
                  <MenuItem onClick={() => this.handleNavigate('/friends')}>
                    Friends
                  </MenuItem>
                  <MenuItem onClick={() => this.handleNavigate('/profile')}>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={onRequestLogout}>Log Out</MenuItem>
                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>
        <div style={{ marginTop: 64 }}>{children}</div>
      </div>
    );
  }

  handleMenu = (event: SyntheticEvent<HTMLButtonElement>) => {
    this.setState({ menuEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ menuEl: null });
  };

  handleNavigate = (path: string) => {
    const { history } = this.props;

    this.setState({ menuEl: null });
    history.push(path);
  };
}
