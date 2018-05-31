import React, { PureComponent } from 'react';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Toggle from 'material-ui/Toggle';
import { FormControl } from 'material-ui/Form';
import { InputLabel } from 'material-ui/Input';
import { topLevelPaperContainer } from '../styles';
import { getLibrary } from '../gameProvider';

const styles = {
  container: {
    ...topLevelPaperContainer
  },
  newGameButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
};

export default class NewGameForm extends PureComponent {
  state = {
    gameName: null,
    title: this.props.user.name + "'s Game",
    players: [this.props.user.id],
    dirtyTitle: false,
    options: {},
    optionsErrors: {},
    error: null
  };

  render() {
    const { gameName, title, players, dirtyTitle, options, error } = this.state;

    const config =
      gameName && getConfiguration(gameName, options, players.length);

    return (
      <Paper style={styles.container}>
        {error && <div>Error: {error}</div>}
        <FormControl>
          <InputLabel htmlFor="game">Select Game</InputLabel>
          <Select
            value={gameName}
            onChange={this.onChangeGame}
            inputProps={{
              name: 'game',
              id: 'game'
            }}
          >
            {getLibrary().map(name => (
              <MenuItem key={name} value={name}>
                {getConfiguration(name).name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Game Title"
          margin="normal"
          value={title}
          onChange={this.onChangeTitle}
        />
        {gameName && this.renderPlayers(config)}
        {gameName && this.renderOptions(gameName)}
        {gameName &&
          title &&
          players.length >= config.minPlayers && (
            <div style={styles.newGameButtonContainer}>
              <Button
                onClick={this.onClickCreateGame.bind(this, config)}
                color="primary"
                variant="raised"
              >
                Create Game
              </Button>
            </div>
          )}
      </Paper>
    );
  }

  renderPlayers(config) {
    const { players } = this.state;
    const { maxPlayers, minPlayers } = config;

    let retval = [];

    for (let i = 0; i < maxPlayers; i++) {
      if (players[i - 1] || i < minPlayers) {
        retval.push(
          <SelectField
            key={i}
            value={players[i]}
            floatingLabelText={`Player ${i + 1}`}
            onChange={this.onChangePlayer.bind(this, i)}
            fullWidth={true}
            errorText={
              !players[i] && i < minPlayers && 'This player is required'
            }
          >
            {this.props.users
              .filter(
                user =>
                  user.id === players[i] || players.indexOf(user.id) === -1
              )
              .map(player => (
                <MenuItem
                  key={player.id}
                  value={player.id}
                  primaryText={player.name}
                />
              ))}
          </SelectField>
        );
      }
    }

    return retval;
  }

  renderOptions(gameName) {
    const stateOptions = this.state.options;
    const stateErrors = this.state.optionsErrors;
    const { options } = getConfiguration(
      gameName,
      stateOptions,
      this.state.players.filter(p => p).length
    );

    if (!options) {
      return null;
    }

    return options.map(option => {
      const { type, name, label, disabled, items, validate } = option;
      const value = stateOptions[name];
      if (type === 'boolean') {
        return (
          <Toggle
            key={name}
            toggled={value}
            onToggle={(e, checked) =>
              this.onChangeOption(name, checked, validate)
            }
            disabled={disabled}
            label={label}
          />
        );
      } else if (type === 'select') {
        return (
          <SelectField
            key={name}
            value={value}
            floatingLabelText={label}
            onChange={(e, k, v) => this.onChangeOption(name, v, validate)}
            errorText={stateErrors[name]}
          >
            {items.map(({ value, label }) => (
              <MenuItem key={value} value={value} primaryText={label} />
            ))}
          </SelectField>
        );
      } else {
        return (
          <TextField
            key={name}
            value={value}
            onChange={e => this.onChangeOption(name, e.target.value, validate)}
            disabled={disabled}
            floatingLabelText={label}
            errorText={stateErrors[name]}
          />
        );
      }
    });
  }

  onChangeGame(ev, i, gameName) {
    this.setState({ gameName });
  }

  onChangeTitle({ target: { value: title } }) {
    this.setState({
      title,
      dirtyTitle: true
    });
  }

  onChangePlayer(index, ev, key, value) {
    const newPlayers = this.state.players.slice();
    newPlayers[index] = value;
    this.setState({ players: newPlayers.filter(player => player) });
  }

  onChangeOption(option, value, validate) {
    this.setState({
      options: {
        ...this.state.options,
        [option]: value
      }
    });

    if (validate) {
      validate({ value })
        .then(valid =>
          this.setState({
            optionsErrors: {
              ...this.state.optionsErrors,
              [option]: valid === true ? false : valid
            }
          })
        )
        .catch(err =>
          this.setState({
            optionsErrors: {
              ...this.state.optionsErrors,
              [option]: err
            }
          })
        );
    }
  }

  onClickCreateGame(config) {
    const { gameName: game, title, options } = this.state;
    const players = this.state.players.filter(player => player);

    this.setState({ dirtyTitle: true, error: null });

    if (!title) {
      return;
    } else if (players.length < config.minPlayers) {
      return;
    }

    const gameData = {
      game,
      title,
      players,
      options
    };

    const { hooks = {} } = getConfiguration(game, options, players);
    const presubmit = hooks.presubmit || (() => Promise.resolve(gameData));

    presubmit(gameData).then(
      gameData =>
        this.props.dispatch({
          type: 'CREATE_GAME',
          data: gameData
        }),
      error =>
        this.setState({
          error: error ? error.message || error.toString() : 'Error'
        })
    );
  }
}
