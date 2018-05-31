//@flow
import React, { PureComponent } from 'react';
import type { Game, Fetch } from '../types';
import FullPageLoading from './FullPageLoading';
import GamesList from './GamesList';

type Props = {
  fetch: Fetch<Array<Game>>
};

type State = {
  games: Array<Game>,
  loading: boolean,
  error: mixed
};

export default class Games extends PureComponent<Props, State> {
  state = {
    games: [],
    loading: true,
    error: null
  };

  componentDidMount() {
    this.props
      .fetch('/api/games')
      .then(games => this.setState({ games, loading: false }))
      .catch(error => this.setState({ error }));
  }

  render() {
    const { games, loading, error } = this.state;

    if (loading) {
      return <FullPageLoading />;
    }

    return <GamesList games={games} />;
  }
}
