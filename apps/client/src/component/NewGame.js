//@flow
import React, { PureComponent } from 'react';
import NewGameForm from './NewGameForm';
import FullPageLoading from './FullPageLoading';
type Props = {
  fetch: Fetch<Array<Game>>
};

type State = {
  loading: boolean
};

export default class NewGame extends PureComponent<Props, State> {
  state = {
    loading: true,
    error: null,
    users: null
  };

  componentDidMount() {
    this.props
      .fetch('/api/users')
      .then(users => this.setState({ users, loading: false }))
      .catch(error => this.setState({ error }));
  }

  render() {
    const { loading, errors, users } = this.state;

    if (loading) {
      return <FullPageLoading />;
    }

    if (error) {
      return JSON.stringify(error);
    }

    return <NewGameForm user={this.props.user} users={users} />;
  }
}
