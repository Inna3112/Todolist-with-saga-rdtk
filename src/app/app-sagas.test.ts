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
    let result = gen.next()
    expect(result.value).toEqual(call(authAPI.me))

    result = gen.next(meResponse)
    expect(result.value).toEqual(put(setIsLoggedInAC(true)))

    result = gen.next()
    expect(result.value).toEqual(put(setIsInitsilizedAC(true)))
})

test('initializeAppSaga login unsuccess', () => {
    const gen = initializeAppSaga()
    let result = gen.next()
    expect(result.value).toEqual(call(authAPI.me))

    //В тесте можно мутировать данные, потому что данные перед каждым тестом пересоздаются
    meResponse.resultCode = 1
    result = gen.next(meResponse)
    expect(result.value).toEqual(put(setIsInitsilizedAC(true)))
})