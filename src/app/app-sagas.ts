import {call, put, takeEvery} from 'redux-saga/effects';
import {authAPI, ResponseMeType, ResponseType} from '../api/todolists-api';
import {setIsLoggedInAC} from '../features/Login/auth-reducer';
import {handleServerAppError, handleServerNetworkError} from '../utils/error-utils';
import {setIsInitsilizedAC} from './app-reducer';


export function* initializeAppSaga() {
    try {
        const data: ResponseType<ResponseMeType> = yield call(authAPI.me)
        if (data.resultCode === 0) {
            yield put(setIsLoggedInAC(true));
        } else {
            handleServerAppError(data, put);
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
