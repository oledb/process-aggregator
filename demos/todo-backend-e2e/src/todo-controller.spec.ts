import axios, { AxiosError } from 'axios';
import {
  NewTodo,
  Priority,
  Todo,
  TodoCommand,
  TodoStatus,
} from '@process-aggregator/todo-sandbox';
import {
  COMMAND_IS_NOT_AVAILABLE,
  CommandValidationException,
  ITask,
  ValidationException,
} from '@oledb/process-aggregator-core';

describe('todo-controller', () => {
  type ErrorMessage = {
    statusCode: number;
    message: string;
  };

  it('should check that tasks list is empty', async () => {
    const response = await axios.get('/api/todo');

    expect(response.status).toEqual(200);
    expect(response.data).toEqual([]);
  });

  it('should try to create new task', async () => {
    const newTodo: NewTodo = {
      name: 'Write essay',
      text: '',
    };

    const errorResponse = (await axios
      .post('/api/todo', newTodo)
      .catch((e) => e)) as AxiosError;

    const error = errorResponse.response.data as ErrorMessage;

    expect(errorResponse.status).toEqual(400);
    expect(error.message).toEqual(
      'Task "initial task" validation error. "text" is empty.'
    );

    const tasksResponse = await axios.get('/api/todo');

    expect(tasksResponse.status).toEqual(200);
    expect(tasksResponse.data).toEqual([]);
  });

  it('should create essay task', async () => {
    const newTodo: NewTodo = {
      // The grammatical error was made intentionally.
      name: 'Writ essay',
      text: 'Essay size is about 5000 chars without spaces',
    };

    const taskResponse = await axios.post<ITask<TodoStatus, Todo>>(
      '/api/todo',
      newTodo
    );
    const task = taskResponse.data;

    expect(taskResponse.status).toEqual(201);
    expect(task.status).toEqual<TodoStatus>('new');
    expect(task.payload.name).toEqual(newTodo.name);
    expect(task.payload.text).toEqual(newTodo.text);
    expect(task.payload.priority).toEqual<Priority>('low');
  });

  it('should move essay task to work', async () => {
    let task = (await axios.get<ITask<TodoStatus, Todo>>(`/api/todo/0`)).data;
    expect(task.status).toEqual('new');

    const commands = (await axios.get(`/api/todo/0/command`)).data;
    expect(commands).toEqual<TodoCommand[]>(['to-work', 'close']);

    task = (
      await axios.post<ITask<TodoStatus, Todo>>(`/api/todo/0/invoke/to-work`)
    ).data;

    expect(task.status).toEqual('in-progress');
  });

  it('should update essay task name', async () => {
    let task = (await axios.get<ITask<TodoStatus, Todo>>(`/api/todo/0`)).data;

    const fixedTodo: Todo = {
      ...task.payload,
      name: 'Write essay',
    };

    const updatedTodo = (
      await axios.put<Todo>('/api/todo/0/payload', fixedTodo)
    ).data;
    task = (await axios.get<ITask<TodoStatus, Todo>>(`/api/todo/0`)).data;

    expect(updatedTodo.name).toEqual(fixedTodo.name);
    expect(task.payload.name).toEqual(fixedTodo.name);
  });

  it('should move essay task to work and get error', async () => {
    const errorResponse = (await axios
      .post<ITask<TodoStatus, Todo>>(`/api/todo/0/invoke/to-work`)
      .catch((e) => e)) as AxiosError;

    const error = errorResponse.response.data as ErrorMessage;

    expect(errorResponse.status).toEqual(400);
    expect(error.message).toEqual(
      new CommandValidationException('to-work', COMMAND_IS_NOT_AVAILABLE)
        .message
    );
  });

  it('should hold essay task', async () => {
    let task = (await axios.get<ITask<TodoStatus, Todo>>(`/api/todo/0`)).data;
    expect(task.status).toEqual<TodoStatus>('in-progress');

    const commands = (await axios.get(`/api/todo/0/command`)).data;
    expect(commands).toEqual<TodoCommand[]>(['hold', 'complete']);

    task = (
      await axios.post<ITask<TodoStatus, Todo>>(`/api/todo/0/invoke/hold`)
    ).data;

    expect(task.status).toEqual('holding');
  });

  it('should move holding task to work', async () => {
    let task = (await axios.get<ITask<TodoStatus, Todo>>(`/api/todo/0`)).data;
    expect(task.status).toEqual<TodoStatus>('holding');

    const commands = (await axios.get(`/api/todo/0/command`)).data;
    expect(commands).toEqual<TodoCommand[]>(['to-work']);

    task = (
      await axios.post<ITask<TodoStatus, Todo>>(`/api/todo/0/invoke/to-work`)
    ).data;

    expect(task.status).toEqual('in-progress');
  });

  it('should create textbook task', async () => {
    const newTodo: NewTodo = {
      name: 'Read the textbook',
      text: 'Read 20 pages a day',
    };

    const taskResponse = await axios.post<ITask<TodoStatus, Todo>>(
      '/api/todo',
      newTodo
    );
    const task = taskResponse.data;

    expect(taskResponse.status).toEqual(201);
    expect(task.status).toEqual<TodoStatus>('new');
  });

  it('should close textbook task', async () => {
    let task = (await axios.get<ITask<TodoStatus, Todo>>(`/api/todo/1`)).data;
    expect(task.status).toEqual<TodoStatus>('new');

    const commands = (await axios.get(`/api/todo/1/command`)).data;
    expect(commands).toEqual<TodoCommand[]>(['to-work', 'close']);

    task = (
      await axios.post<ITask<TodoStatus, Todo>>(`/api/todo/1/invoke/close`)
    ).data;

    expect(task.status).toEqual('closed');
  });

  it('should invoke incorrect task for textbook task', async () => {
    const commands = (await axios.get(`/api/todo/1/command`)).data;
    expect(commands).toEqual<TodoCommand[]>([]);

    const errorResponse = (await axios
      .post<ITask<TodoStatus, Todo>>(`/api/todo/1/invoke/to-work`)
      .catch((e) => e)) as AxiosError;

    const error = errorResponse.response.data as ErrorMessage;

    expect(errorResponse.status).toEqual(400);
    expect(error.message).toEqual(
      new CommandValidationException('to-work', COMMAND_IS_NOT_AVAILABLE)
        .message
    );
  });

  it('should complete essay task', async () => {
    let task = (await axios.get<ITask<TodoStatus, Todo>>(`/api/todo/0`)).data;
    expect(task.status).toEqual<TodoStatus>('in-progress');

    const commands = (await axios.get(`/api/todo/0/command`)).data;
    expect(commands).toEqual<TodoCommand[]>(['hold', 'complete']);

    task = (
      await axios.post<ITask<TodoStatus, Todo>>(`/api/todo/0/invoke/complete`)
    ).data;

    expect(task.status).toEqual('completed');
  });

  it('should close essay task', async () => {
    let task = (await axios.get<ITask<TodoStatus, Todo>>(`/api/todo/0`)).data;
    expect(task.status).toEqual<TodoStatus>('completed');

    const commands = (await axios.get(`/api/todo/0/command`)).data;
    expect(commands).toEqual<TodoCommand[]>(['close']);

    task = (
      await axios.post<ITask<TodoStatus, Todo>>(`/api/todo/0/invoke/close`)
    ).data;

    expect(task.status).toEqual('closed');
  });

  it('should failed to update essay task', async () => {
    const fixedTodo: Todo = {
      name: '[Failed] Write essay',
      text: '=(',
      workStared: new Date(),
      created: new Date(),
      priority: 'medium',
    };

    const errorResponse = (await axios
      .put<Todo>('/api/todo/0/payload', fixedTodo)
      .catch((e) => e)) as AxiosError;

    const error = errorResponse.response.data as ErrorMessage;

    expect(errorResponse.status).toEqual(400);
    expect(error.message).toEqual(
      new ValidationException(
        '0',
        `Updating a task with status closed is prohibited`
      ).message
    );
  });

  it('should failed to read essay task', async () => {
    const errorResponse = (await axios
      .get<Todo>('/api/todo/0')
      .catch((e) => e)) as AxiosError;

    const error = errorResponse.response.data as ErrorMessage;

    expect(errorResponse.status).toEqual(400);
    expect(error.message).toEqual(
      new ValidationException(
        '0',
        'Reading a task with status closed is prohibited'
      ).message
    );
  });
});
