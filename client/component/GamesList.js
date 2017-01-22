import React, { PureComponent } from 'react';
import autobind from 'autobind-decorator';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui';
import { Paper } from 'material-ui';
import { RaisedButton } from 'material-ui';
import { Toggle } from 'material-ui';
import castArray from 'lodash/castArray';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { topLevelPaperContainer } from '../styles';
import { getConfiguration } from '../gameProvider';
import renderAfterModuleLoaded from '../hoc/renderAfterModuleLoaded';

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

@connect(state => ({
    games: state.games,
    users: state.users,
}))
@renderAfterModuleLoaded(() => ['/assets/scripts/games/configurations.js'])
@autobind
export default class GamesList extends PureComponent {
    state = {
        showCompleted: false
    };

    render() {
        const { users } = this.props;
        const { showCompleted } = this.state;
        const games = this.props.games
            .filter(game => !showCompleted ^ game.mode === 'gameover')
            .sort((a, b) => getTimeGameUpdatedAsNumber(b) - getTimeGameUpdatedAsNumber(a));

        if (!users || !users.length || !games || !games.length) {
            return this.renderNoGames();
        }

        return (
            <div>
                <Toggle label="Show Completed" style={styles.completedGamesToggle} onToggle={this.onToggleCompleted}/>
                <Table onRowSelection={this.onClickTableRow.bind(this, games)}>
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn>Game</TableHeaderColumn>
                            <TableHeaderColumn>Title</TableHeaderColumn>
                            <TableHeaderColumn>Players</TableHeaderColumn>
                            {showCompleted && <TableHeaderColumn>Winner(s)</TableHeaderColumn>}
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false} showRowHover={true} stripedRows={true}>
                        {games.map(game =>
                            <TableRow key={game.id}>
                                <TableRowColumn>{getConfiguration(game.game).name}</TableRowColumn>
                                <TableRowColumn>{game.title}</TableRowColumn>
                                <TableRowColumn>{game.players.map((id, key) => {
                                    const user = users.find(player => player.id == id);
                                    return (
                                        <div key={key}>{user ? user.name : 'Deleted User'}</div>
                                    );
                                })}</TableRowColumn>
                                {showCompleted &&
                                    <TableRowColumn>
                                        {getWinnersArray(game, users).map(
                                            winner => <div key={winner}>{winner}</div>
                                        )}
                                    </TableRowColumn>
                                }
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        );
    }

    renderNoGames() {
        const { showCompleted } = this.state;
        const newGameButton = (
            <RaisedButton
                primary={true}
                label="Start a game"
                onClick={this.onClickNewGame}
            />);

        if (!this.props.games || !this.props.games.length) {
            return (
                <Paper style={styles.emptyTableContainer}>
                    <p>Welcome to CardboardEZ. Get started with your first game.</p>
                    {newGameButton}
                </Paper>
            );
        } else {
            return (
                <Paper style={styles.emptyTableContainer}>
                    <p>You don't have any {showCompleted ? 'completed' : 'active'} games.</p>
                    <Toggle
                        label={`Show ${showCompleted ? 'Active' : 'Completed'}`}
                        style={styles.completedGamesToggle}
                        onToggle={this.onToggleCompleted}
                        toggled={this.state.showCompleted}
                    />
                    {newGameButton}
                </Paper>
            );
        }
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
};