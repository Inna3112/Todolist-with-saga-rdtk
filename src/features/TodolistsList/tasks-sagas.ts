import {call, put, select, takeEvery} from 'redux-saga/effects';
import {setAppStatusAC} from '../../app/app-reducer';
import {AxiosResponse} from 'axios';
import {GetTasksResponse, ResponseType, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api';
import {
    addTaskAC,
    removeTaskAC,
    setTasksAC,
    UpdateDomainTaskModelType,
    updateTaskAC,
} from './tasks-reducer';
import {
    handleServerAppErrorSaga,
    handleServerNetworkErrorSaga
} from '../../utils/error-utils';
import {AppRootStateType} from '../../app/store';

export function* fetchTasksSaga(action: ReturnType<typeof fetchTasksAC>) {
    yield put(setAppStatusAC('loading'))
    const data: GetTasksResponse = yield call(todolistsAPI.getTasks, action.todolistId)

    const tasks = data.items
    yield put(setTasksAC(tasks, action.todolistId))
    yield put(setAppStatusAC('succeeded'))
}
export const fetchTasksAC = (todolistId: string) => ({type: 'TASKS/FETCH-TASKS', todolistId} as const)


export function* removeTaskSaga(action: ReturnType<typeof removeTaskACSaga>) {
    let res: AxiosResponse<ResponseType> = yield call(todolistsAPI.deleteTask, action.todolistId, action.taskId)

    yield put(removeTaskAC(action.taskId, action.todolistId))
}
export const removeTaskACSaga = (todolistId: string, taskId: string) => ({type: 'TASKS/REMOVE-TASK-SAGA', todolistId, taskId})


export function* addTaskSaga(action: ReturnType<typeof addTaskACSaga>) {
    try {
        const data: ResponseType<{ item: TaskType }> = yield call(todolistsAPI.createTask, action.todolistId, action.title)
        if (data.resultCode === 0) {
            const task = data.data.item
            yield put(addTaskAC(task))
            yield put(setAppStatusAC('succeeded'))
        } else {
            yield* handleServerAppErrorSaga(data);
        }
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error)
    }
}
export const addTaskACSaga = (todolistId: string, title: string) => ({type: 'TASKS/ADD-TASK-SAGA', todolistId, title})


export function* updateTaskSaga(action: ReturnType<typeof updateTaskACSaga>) {
    let state: AppRootStateType = yield select()

    const task = state.tasks[action.todolistId].find(t => t.id === action.taskId)
    if (!task) {
        //throw new Error("task not found in the state");
        console.warn('task not found in the state')
        return
    }

    const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...action.domainModel
    }
    try {
        const res: AxiosResponse<ResponseType<TaskType>> = yield call(todolistsAPI.updateTask, action.todolistId, action.taskId, apiModel)
        if (res.data.resultCode === 0) {
            yield put(updateTaskAC(action.taskId, action.domainModel, action.todolistId))
        } else {
            yield* handleServerAppErrorSaga(res.data);
        }
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error);
    }
}

export const updateTaskACSaga = (todolistId: string, taskId: string, domainModel: UpdateDomainTaskModelType) => {
    return {
        type: 'TASKS/UPDATE-TASK-SAGA',
        todolistId,
        taskId,
        domainModel
    }
}

export function* tasksWatcherSaga(){
    yield takeEvery('TASKS/FETCH-TASKS', fetchTasksSaga)
    yield takeEvery('TASKS/REMOVE-TASK-SAGA', removeTaskSaga)
    yield takeEvery('TASKS/ADD-TASK-SAGA', addTaskSaga)
    yield takeEvery('TASKS/UPDATE-TASK-SAGA', updateTaskSaga)
}
