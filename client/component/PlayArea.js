import React, { PureComponent } from 'react';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import { getPlayArea } from '../gameProvider';
import renderAfterModuleLoaded from '../hoc/renderAfterModuleLoaded';
import { getCurrentGame, getCurrentPlayerFromCurrentGame } from '../selectors/games';

@connect((state, props) => ({
    game: getCurrentGame(state, props),
    me: getCurrentPlayerFromCurrentGame(state, props),
}))
@renderAfterModuleLoaded(({ game }) => game ? [`/assets/games/${game.game}/client.js`] : [])
@autobind
export default class PlayArea extends PureComponent {
    render() {
        const { game, me } = this.props;

        if (!game || !me) {
            return null;
        }

        const PlayArea = getPlayArea(game.game);

        return <PlayArea
            key={game.id}
            game={game}
            me={me}
            onSendAction={this.onSendAction}
            publicBaseURL={`/assets/games/${game.game}`}
        />;
    }

    onSendAction(data) {
        this.props.dispatch({ type: 'GAME_ACTION', data: { id: this.props.params.id, ...data } });
    }
}