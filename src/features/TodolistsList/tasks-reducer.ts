import {
    addTodolistAC, removeTodolistAC,
    setTodolistsAC,
} from './todolists-reducer'
import {
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    UpdateTaskModelType
} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {setAppStatusAC} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';

const initialState: TasksStateType = {}

//данные в санк нужно передавать обьектом пейлоад, если их несколько
//thunkAPI - это диспатч и гетстейт
//ВЫГОДА ТАКОЙ САНК: создается 2 екшена - один выполнится при успешном выполнении запроса на сервер, второй при ошибке

// fetchTasksTC
interface FetchTasksData {
    tasks: TaskType[],
    todolistId: string
}

export const fetchTasksTC = createAsyncThunk<FetchTasksData, string>('tasks/fetchTasks', (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    //нужно обязательно вернуть промис в builder
    return todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            // thunkAPI.dispatch(setTasksAC({tasks, todolistId}))
            thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
            //здесь ретурнится промис из then зарезолвленный этим обьектом
            return {tasks, todolistId} as FetchTasksData
        })
})

// removeTaskTC
interface RemoveTaskData {
    taskId: string,
    todolistId: string
}
export const removeTaskTC = createAsyncThunk<RemoveTaskData, RemoveTaskData>('tasks/removeTask', async (param: { taskId: string, todolistId: string }, thunkAPI) => {
    const res = todolistsAPI.deleteTask(param.todolistId, param.taskId)
    return ({taskId: param.taskId, todolistId: param.todolistId} as RemoveTaskData)
})


export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            if (res.data.resultCode === 0) {
                const task = res.data.data.item
                const action = addTaskAC({task})
                dispatch(action)
                dispatch(setAppStatusAC({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: any, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
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
            ...domainModel
        }

        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                if (res.data.resultCode === 0) {
                    const action = updateTaskAC({taskId, model: domainModel, todolistId})
                    dispatch(action)
                } else {
                    handleServerAppError(res.data, dispatch);
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch);
            })
    }

const slice = createSlice({
    name: 'tasks',
    initialState: initialState,
    // здесь выполняют функцию редюсеров и создают экшены
    reducers: {
        // removeTaskAC(state, action: PayloadAction<{taskId: string, todolistId: string}>){
        //     const tasks = state[action.payload.todolistId]
        //     const index = tasks.findIndex(t => t.id === action.payload.taskId)
        //     if(index > -1){
        //         tasks.splice(index, 1)
        //     }
        // },
        addTaskAC(state, action: PayloadAction<{ task: TaskType }>) {
            state[action.payload.task.todoListId].unshift(action.payload.task)
        },
        updateTaskAC(state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>) {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            if (index > -1) {
                tasks[index] = {...tasks[index], ...action.payload.model}
            }
        },
        // setTasksAC(state, action: PayloadAction<{tasks: Array<TaskType>, todolistId: string}>){
        //     state[action.payload.todolistId] = action.payload.tasks
        // },
    },
    // нужны тогда, когда не нужно создавать экшен - он уже создат в todolistReducer, а нужно выполнить функцию редюсера
    //можно обработать АС написанные вручную здесь

    //можно передать обьектом, но тогда нужно будет выносить типизацию екшина вручную
    // extraReducers: {
    // [addTodolistAC.type](state, action: PayloadAction<{}>){},
    // [removeTodolistAC.type](state, action: PayloadAction<{}>){},
    // [setTodolistsAC.type](state, action: PayloadAction<{}>){},
    // }
    //поэтому:
    extraReducers: (builder) => {
        builder.addCase(addTodolistAC, (state, action) => {
            state[action.payload.todolist.id] = []
        });
        builder.addCase(removeTodolistAC, (state, action) => {
            delete state[action.payload.id]
        });
        builder.addCase(setTodolistsAC, (state, action) => {
            action.payload.todolists.forEach((tl: any) => {
                state[tl.id] = []
            })
        });
        builder.addCase(fetchTasksTC.fulfilled, (state, action) => {
            state[action.payload.todolistId] = action.payload.tasks
        });
        builder.addCase(removeTaskTC.fulfilled, (state, action) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            if (index > -1) {
                tasks.splice(index, 1)
            }
        });
    }
})

export const tasksReducer = slice.reducer
export const {addTaskAC, updateTaskAC} = slice.actions


// thunks


// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
