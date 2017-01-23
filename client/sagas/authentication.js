import { browserHistory } from 'react-router'
import { put, take } from 'redux-saga/effects'
import feathers from '../feathers';

export function* watchForLogout() {
    try {
        while (true) {
            yield take('LOGOUT');
            yield feathers.logout();
            browserHistory.push('/login');
            yield put({ type: 'LOGOUT_SUCCESS' });
        }
    } catch (error) {
        yield put({ type: 'LOGOUT_FAILURE', error });
    }
};