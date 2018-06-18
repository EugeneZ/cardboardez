// @flow
import React, { PureComponent } from 'react';
import Friends from './Friends';
import type { User } from '../types';

type Props = {
  users: Array<User>,
  friends: Array<User>,
  onAddFriend: (id: string) => mixed,
  onRemoveFriend: (id: string) => mixed
};

export default class ManageFriends extends PureComponent<Props> {
  handleSelectUser = id => {
    const { friends, onAddFriend, onRemoveFriend } = this.props;
    if (friends.find(friend => friend.id === id)) {
      onRemoveFriend(id);
    } else {
      onAddFriend(id);
    }
  };

  render() {
    const { users, friends } = this.props;
    return (
      <div>
        <Friends
          onSelectUser={this.handleSelectUser}
          friends={friends}
          users={users}
          selected={friends.map(id => id)}
        />
      </div>
    );
  }
}
