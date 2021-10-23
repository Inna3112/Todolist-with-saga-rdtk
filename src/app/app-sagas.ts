import {call, put, takeEvery} from 'redux-saga/effects';
import {authAPI} from '../api/todolists-api';
import {setIsLoggedInAC} from '../features/Login/auth-reducer';
import {handleServerAppError, handleServerNetworkError} from '../utils/error-utils';
import {setIsInitsilizedAC} from './app-reducer';

export function* initializeAppSaga() {
    try {
        const res = yield call(authAPI.me)
        if (res.data.resultCode === 0) {
            yield put(setIsLoggedInAC(true));
        } else {
            handleServerAppError(res.data, put);
        }
    } catch (error) {
        handleServerNetworkError(error, put)
    } finally {
        yield put(setIsInitsilizedAC(true))
    }
}
export const initializeAppAC = () => ({type: 'APP/INITIALIZED-APP'})

export function* appWatcherSaga(){
    yield takeEvery('APP/INITIALIZED-APP', initializeAppSaga)

}
