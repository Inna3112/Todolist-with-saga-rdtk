import {Dispatch} from 'redux';
import {setAppStatusAC} from '../../app/app-reducer'
import {authAPI, LoginRequestType} from '../../api/todolists-api';
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';


const initialState = {
    isLoggedIn: false
}

const slice = createSlice({
    name: 'auth',
    initialState: initialState,
    //reducers здесь может быть либо функцией либо обьектом
    reducers: {
        //название должно совпадать с уже существующими AC
        //сюда приходит не сам стейт а stateDraft, поэтому можно его мутабельно менять
        setIsLoggedInAC(state, action: PayloadAction<{value: boolean}>){
            //логика преобразования стейта
            state.isLoggedIn = action.payload.value
        }
    }
})


export const authReducer = slice.reducer
export const setIsLoggedInAC = slice.actions.setIsLoggedInAC


// thunks
export const loginTC = (data: LoginRequestType) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    authAPI.login(data)
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedInAC({value: true}))
                dispatch(setAppStatusAC({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch(error => {
            handleServerNetworkError(error, dispatch)
        })
}
export const logoutTC = () => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    authAPI.logout()
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedInAC({value: false}))
                dispatch(setAppStatusAC({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch(error => {
            handleServerNetworkError(error, dispatch)
        })
}

