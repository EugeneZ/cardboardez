// @flow
import React, { PureComponent } from 'react';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';
import Checkbox from '@material-ui/core/Checkbox';

type User = { id: string, name: string };

type Props = {
  friends: Array<User>,
  users: Array<User>,
  selected: Array<string>,
  onSelectUser: (id: string) => mixed
};

type State = {
  search: string
};

export default class AddFriend extends PureComponent<Props, State> {
  state = {
    search: ''
  };

  render() {
    const { users, friends, selected, onSelectUser } = this.props;
    const { search } = this.state;
    return (
      <div>
        <TextField
          id="search"
          label="Search"
          value={search}
          onChange={({ target }) => this.setState({ search: target.value })}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <List>
          {users.map(({ id, name }) => (
            <ListItem button onClick={() => onSelectUser(id)}>
              <Checkbox
                checked={!!selected.find(selectedId => selectedId === id)}
                tabIndex={-1}
                disableRipple
              />
              <Avatar>
                <PersonIcon />
              </Avatar>
              <ListItemText
                primary={name}
                secondary={friends.find(friend => friend.id === id) && 'Friend'}
              />
            </ListItem>
          ))}
        </List>
      </div>
    );
  }
}
