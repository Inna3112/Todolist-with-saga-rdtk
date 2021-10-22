import {call, put, takeEvery} from 'redux-saga/effects';
import {setAppStatusAC} from '../../app/app-reducer';
import {AxiosResponse} from 'axios';
import {GetTasksResponse, ResponseType, todolistsAPI} from '../../api/todolists-api';
import {removeTaskAC, setTasksAC} from './tasks-reducer';

export function* fetchTasksSaga(action: ReturnType<typeof fetchTasksAC>) {
    yield put(setAppStatusAC('loading'))
    const res: AxiosResponse<GetTasksResponse> = yield call(todolistsAPI.getTasks, action.todolistId)

    const tasks = res.data.items
    yield put(setTasksAC(tasks, action.todolistId))
    yield put(setAppStatusAC('succeeded'))
}
export const fetchTasksAC = (todolistId: string) => ({type: 'TASKS/FETCH-TASKS', todolistId})

export function* removeTaskSaga(action: ReturnType<typeof removeTaskACSaga>) {
    let res: AxiosResponse<ResponseType> = yield call(todolistsAPI.deleteTask, action.todolistId, action.taskId)

    yield put(removeTaskAC(action.taskId, action.todolistId))
}
export const removeTaskACSaga = (todolistId: string, taskId: string) => ({type: 'TASKS/REMOVE-TASK-SAGA', todolistId, taskId})


export function* tasksWatcherSaga(){
    yield takeEvery('TASKS/FETCH-TASKS', fetchTasksSaga)
    yield takeEvery('TASKS/REMOVE-TASK-SAGA', removeTaskSaga)
}
