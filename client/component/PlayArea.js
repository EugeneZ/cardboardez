import React, { PureComponent } from 'react';
import { getPlayArea } from '../gameProvider';
import loadRemoteModule from '../hoc/loadRemoteModule';

const mapPropsToModuleNames = props => ({
    playarea: props.games && props.games.length && props.games.find(game => game.id === props.params.id).game + '/client'
});

@loadRemoteModule(mapPropsToModuleNames)
export default class PlayArea extends PureComponent {
    render() {
        const { games, params, playarea } = this.props;
        if (!games || !games.length || !playarea) {
            return null;
        }

        const game = games.filter(game => game.id === params.id)[0];

        if (!game) {
            return <div>Game not allowed</div>;
        }

        const PlayArea = getPlayArea(game.game);
        if (PlayArea) {
            return React.createElement(PlayArea, this.props);
        } else {
            return "Loading module...";
        }
    }
}