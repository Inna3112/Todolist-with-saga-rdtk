import {fetchTasksSaga} from './tasks-sagas';
import {setAppStatusAC} from '../../app/app-reducer';
import {call, put} from 'redux-saga/effects';
import {TaskPriorities, TaskStatuses, todolistsAPI} from '../../api/todolists-api';
import {setTasksAC} from './tasks-reducer';


beforeEach(() => {

})
test('fetchTasksSaga success flow', () => {
    const todolistId = 'todolistId';

    const gen = fetchTasksSaga({type: 'TASKS/FETCH-TASKS', todolistId: todolistId})
    let result = gen.next()
    expect(result.value).toEqual(put(setAppStatusAC('loading')))

    result = gen.next()
    expect(result.value).toEqual(call(todolistsAPI.getTasks, todolistId))

    const fakeApiResponse = {
        error: null,
        totalCount: 1,
        items: [{
            description: '',
            title: 'Task1',
            status: TaskStatuses.New,
            priority: TaskPriorities.Low,
            startDate: '',
            deadline: '',
            id: 'taskId',
            todoListId: todolistId,
            order: 1,
            addedDate: ''
        }]
    }
    result = gen.next(fakeApiResponse)
    expect(result.value).toEqual(put(setTasksAC(fakeApiResponse.items, todolistId)))

    result = gen.next()
    expect(result.value).toEqual(put(setAppStatusAC('succeeded')))

})

