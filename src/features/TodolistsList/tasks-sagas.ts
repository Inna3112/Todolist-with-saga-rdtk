import {call, put, takeEvery} from 'redux-saga/effects';
import {setAppStatusAC} from '../../app/app-reducer';
import {AxiosResponse} from 'axios';
import {GetTasksResponse, ResponseType, TaskType, todolistsAPI} from '../../api/todolists-api';
import {addTaskAC, removeTaskAC, setTasksAC} from './tasks-reducer';
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils';

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

export function* addTaskSaga(action: ReturnType<typeof addTaskACSaga>) {
    try {
        const res: AxiosResponse<ResponseType<{ item: TaskType }>> = yield call(todolistsAPI.createTask, action.todolistId, action.title)
        if (res.data.resultCode === 0) {
            const task = res.data.data.item
            yield put(addTaskAC(task))
            yield put(setAppStatusAC('succeeded'))
        } else {
            handleServerAppError(res.data, put);
        }
    } catch (error) {
        handleServerNetworkError(error, put)
    }
}
export const addTaskACSaga = (todolistId: string, title: string) => ({type: 'TASKS/ADD-TASK-SAGA', todolistId, title})


export function* tasksWatcherSaga(){
    yield takeEvery('TASKS/FETCH-TASKS', fetchTasksSaga)
    yield takeEvery('TASKS/REMOVE-TASK-SAGA', removeTaskSaga)
    yield takeEvery('TASKS/ADD-TASK-SAGA', addTaskSaga)
}
