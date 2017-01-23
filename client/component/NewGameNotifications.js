import React, { PureComponent } from 'react';
import { Snackbar } from 'material-ui';

export default class NewGameNotifications extends PureComponent {
    state = {
        dismissedGames: []
    };

    render() {
        const { games } = this.props;
        const { dismissedGames } = this.state;

        return (
            <div>
                {games.map(game =>
                    <Snackbar
                        key={game.id}
                        open={!dismissedGames.includes(game.id)}
                        message="New Game Found"
                        action="Take Me There"
                        onRequestClose={this.onDismiss.bind(this, game.id)}
                        onActionTouchTap={this.onGotoGame.bind(this, game.id)}
                    />
                )}
            </div>
        );
    }

    onDismiss(id) {
        this.setState({
            dismissedGames: this.state.dismissedGames.slice().concat(id)
        });
    }

    onGotoGame(id) {
        this.setState({
            dismissedGames: this.state.dismissedGames.slice().concat(id)
        });
        this.props.onGotoGame(id);
    }
}