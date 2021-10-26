import {Dispatch} from 'redux';
import {setAppStatusAC} from '../../app/app-reducer'
import {authAPI, ErrorResponseType, LoginRequestType} from '../../api/todolists-api';
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AxiosError} from 'axios';

// interface LoginData {
//     isLoggedIn: boolean
// }

export const loginTC = createAsyncThunk<undefined, LoginRequestType, {rejectValue: {errors: string[], fieldsErrors?: Array<ErrorResponseType>} }>('auth/login', async (param, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await authAPI.login(param)
        if (res.data.resultCode === 0) {
            thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
            // thunkAPI.dispatch(setIsLoggedInAC({value: true}))
            return
        } else {
            handleServerAppError(res.data, thunkAPI.dispatch)
            return thunkAPI.rejectWithValue({errors: res.data.messages, fieldsErrors: res.data.fieldsErrors})
        }
    } catch (err) {
        const error: AxiosError = err

        handleServerNetworkError(error, thunkAPI.dispatch)
        return thunkAPI.rejectWithValue({errors: [error.message], fieldsErrors: undefined})
    }
})



const slice = createSlice({
    name: 'auth',
    initialState: {
        isLoggedIn: false
    },
    //reducers здесь может быть либо функцией либо обьектом
    reducers: {
        // название должно совпадать с уже существующими AC
        // сюда приходит не сам стейт а stateDraft, поэтому можно его мутабельно менять
        setIsLoggedInAC(state, action: PayloadAction<{ value: boolean }>) {
            //логика преобразования стейта
            state.isLoggedIn = action.payload.value
        }
    },
    extraReducers: builder => {
        builder.addCase(loginTC.fulfilled, (state) => {
            state.isLoggedIn = true
        })
    }
})


export const authReducer = slice.reducer
export const setIsLoggedInAC = slice.actions.setIsLoggedInAC


// thunks

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

