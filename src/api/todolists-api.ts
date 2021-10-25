import axios, {AxiosResponse} from 'axios'

const instance = axios.create({
    baseURL: 'https://social-network.samuraijs.com/api/1.1/',
    withCredentials: true,
    headers: {
        'API-KEY': 'a585aace-28a5-48d9-b1ef-e81ab36cf848'
    }
})

// api
export const todolistsAPI = {
    getTodolists() {
        const promise = instance.get<TodolistType[]>('todo-lists');
        return promise;
    },
    createTodolist(title: string) {
        const promise = instance.post<ResponseType<{ item: TodolistType }>>('todo-lists', {title: title});
        return promise;
    },
    deleteTodolist(id: string) {
        const promise = instance.delete<ResponseType>(`todo-lists/${id}`);
        return promise;
    },
    updateTodolist(id: string, title: string) {
        const promise = instance.put<ResponseType>(`todo-lists/${id}`, {title: title});
        return promise;
    },
    getTasks(todolistId: string): Promise<AxiosResponse<GetTasksResponse>> {
        return instance.get<GetTasksResponse>(`todo-lists/${todolistId}/tasks`);
    },
    deleteTask(todolistId: string, taskId: string):Promise<AxiosResponse<ResponseType>> {
        return instance.delete<ResponseType>(`todo-lists/${todolistId}/tasks/${taskId}`);
    },
    createTask(todolistId: string, taskTitile: string): Promise<AxiosResponse<ResponseType<{ item: TaskType }>>> {
        return instance.post<ResponseType<{ item: TaskType }>>(`todo-lists/${todolistId}/tasks`, {title: taskTitile});
    },
    updateTask(todolistId: string, taskId: string, model: UpdateTaskModelType): Promise<AxiosResponse<ResponseType<TaskType>>> {
        return instance.put<ResponseType<TaskType>>(`todo-lists/${todolistId}/tasks/${taskId}`, model);
    }
}
export const authAPI = {
    login(data: LoginRequestType){
        return instance.post<ResponseType<{userId: number}>>('auth/login', data)
    },
    me(){
        return instance.get<ResponseType<ResponseMeType>>('auth/me')
            .then(res => res.data)
    },
    logout(){
        return instance.delete<ResponseType>('auth/login')
    }
}
// types
export type ResponseMeType = {
    id: number
    email: string
    login: string
}
export type LoginRequestType = {
    email: string
    password: string
    rememberMe: boolean
    captcha?: string
}
export type TodolistType = {
    id: string
    title: string
    addedDate: string
    order: number
}
export type ResponseType<D = {}> = {
    resultCode: number
    messages: Array<string>
    data: D
}

export enum TaskStatuses {
    New = 0,
    InProgress = 1,
    Completed = 2,
    Draft = 3
}

export enum TaskPriorities {
    Low = 0,
    Middle = 1,
    Hi = 2,
    Urgently = 3,
    Later = 4
}

export type TaskType = {
    description: string
    title: string
    status: TaskStatuses
    priority: TaskPriorities
    startDate: string
    deadline: string
    id: string
    todoListId: string
    order: number
    addedDate: string
}
export type UpdateTaskModelType = {
    title: string
    description: string
    status: TaskStatuses
    priority: TaskPriorities
    startDate: string
    deadline: string
}
export type GetTasksResponse = {
    error: string | null
    totalCount: number
    items: TaskType[]
}
