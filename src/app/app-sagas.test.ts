import {initializeAppSaga} from './app-sagas';
import {call, put} from 'redux-saga/effects';
import {authAPI, ResponseMeType, ResponseType} from "../api/todolists-api";
import {setIsLoggedInAC} from "../features/Login/auth-reducer";
import {setIsInitsilizedAC} from "./app-reducer";

let meResponse: ResponseType<ResponseMeType>

beforeEach(() => {
    meResponse = {
        resultCode: 0,
        messages: [],
        data: {
            id: 12,
            email: '',
            login: ''
        }
    }
})
test('initializeAppSaga login success', () => {
    const gen = initializeAppSaga()

    expect(gen.next().value).toEqual(call(authAPI.me))
    expect(gen.next(meResponse).value).toEqual(put(setIsLoggedInAC(true)))
    expect(gen.next().value).toEqual(put(setIsInitsilizedAC(true)))
})

test('initializeAppSaga login unsuccess', () => {
    const gen = initializeAppSaga()

    expect(gen.next().value).toEqual(call(authAPI.me))

    //В тесте можно мутировать данные, потому что данные перед каждым тестом пересоздаются
    meResponse.resultCode = 1
    expect(gen.next(meResponse).value).toEqual(put(setIsInitsilizedAC(true)))
})