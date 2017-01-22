import { createSelector } from 'reselect';

function getUserById(users, id) {
    return users && users.find(user => user.id === id);
}

export const currentUser = createSelector(
    state => state.users,
    state => state.user,

    (users, user) => users && users.length && user && user.id && getUserById(users, user.id)
);
