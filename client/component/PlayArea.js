import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getPlayArea } from '../gameProvider';
import renderAfterModuleLoaded from '../hoc/renderAfterModuleLoaded';
import { getCurrentGame } from '../selectors/games';

@connect((state, props) => ({
    game: getCurrentGame(state, props),
}))
@renderAfterModuleLoaded(({ game }) => game ? [`/assets/scripts/games/${game.game}/client.js`] : [])
export default class PlayArea extends PureComponent {
    render() {
        const { game } = this.props;

        if (!game) {
            return null;
        }

        const PlayArea = getPlayArea(game.game);

        return <PlayArea
            game={game}
        />;
    }
}