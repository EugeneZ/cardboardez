//@flow
import React, { PureComponent } from 'react';
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import castArray from 'lodash/castArray';
import { topLevelPaperContainer } from '../styles';
import type { Game } from '../types';
import Button from 'material-ui/Button';
import distanceInWords from 'date-fns/distance_in_words';

const styles = {
  emptyTableContainer: topLevelPaperContainer,
  completedGamesToggle: {
    margin: 16,
    width: 200
  }
};

function getWinnersArray(game, users) {
  const winners = game.winner || game.winners;
  if (!winners) {
    return [];
  }

  return castArray(winners).map(winner => {
    if (winner && winner.name) {
      return name;
    } else if (game.players.includes(winner)) {
      const player = users.find(player => player.id === winner);
      return (player && player.name) || 'Deleted User';
    } else {
      return winner;
    }
  });
}

function getTimeGameUpdatedAsNumber(game) {
  return parseInt(game.updated.replace(/[^0-9]/g, ''), 10);
}

type Props = {
  games: Array<Games>
};

export default class GamesList extends PureComponent<Props> {
  render() {
    const { users } = this.props;
    const games = this.props.games
      .filter(game => !game.winner && !game.winners)
      .sort(
        (a, b) => getTimeGameUpdatedAsNumber(b) - getTimeGameUpdatedAsNumber(a)
      );

    if (!games || !games.length) {
      return (
        <Paper style={styles.emptyTableContainer}>
          <p>Welcome to CardboardEZ. Get started with your first game.</p>
          <Button
            variant="raised"
            primary={true}
            label="Start a game"
            onClick={this.onClickNewGame}
          />
        </Paper>
      );
    }

    return (
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Game</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Players</TableCell>
              <TableCell>Last Played</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.map(game => (
              <TableRow key={game.id}>
                <TableCell>{game.game}</TableCell>
                <TableCell>{game.title}</TableCell>
                <TableCell>
                  {game._meta.players.map(player => player.name)}
                </TableCell>
                <TableCell>
                  {distanceInWords(game.updated, new Date())} ago
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  onClickTableRow(games, [index]) {
    this.onGotoGame(games[index]);
  }

  onToggleCompleted() {
    this.setState({ showCompleted: !this.state.showCompleted });
  }

  onGotoGame({ id }) {
    browserHistory.push({ pathname: `/game/${id}` });
  }

  onClickNewGame() {
    browserHistory.push({ pathname: '/new' });
  }
}
