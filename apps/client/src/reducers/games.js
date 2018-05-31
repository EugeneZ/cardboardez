function addOrUpdateGame(state, game, merge = {}) {
  if (!game || !game.id) {
    return state;
  }
  const newState = state.slice().filter(g => g.id !== game.id);
  newState.push({
    ...merge,
    ...game
  });
  return newState;
}

export default function(state = [], action) {
  switch (action.type) {
    case 'FETCH_GAMES_SUCCESS':
      if (state.length) {
        action.data.forEach(game => (state = addOrUpdateGame(state, game)));
        return state;
      } else {
        return action.data;
      }
    case 'CREATE_GAME_SUCCESS': // this triggers in addition to REALTIME_GAME_CREATED, but only if this user created the game
      return addOrUpdateGame(state, action.data, {
        createdByMe: true
      });
    case 'REALTIME_GAME_CREATED': // triggers for all games created
      return addOrUpdateGame(state, action.data, {
        createdRealtime: true
      });
    case 'REALTIME_GAME_UPDATED':
      return addOrUpdateGame(state, action.data);
    case 'REALTIME_GAME_REMOVED':
      return state.slice().filter(game => game.id !== action.data.id);
    default:
      return state;
  }
}
