import { RootModule } from '../app/root-module';
import {
  TODO_PROCESS_NAME,
  TodoCommand,
  TodoStatus,
  NewTodo,
  Todo,
} from '../app';
import {
  bootstrapApplication,
  COMMAND_IS_NOT_AVAILABLE,
  CommandValidationException,
} from '@oledb/process-aggregator-core';
import { readIsProhibited, updatingIsProhibited } from '../app/process/steps';

describe('todo-sandbox', () => {
  const app = bootstrapApplication<TodoStatus, Todo, TodoCommand>(
    RootModule,
    TODO_PROCESS_NAME
  );
  it('should checks that tasks list is empty', async () => {
    expect(await app.getTasks()).toEqual([]);
  });

  it('should create new task with exception', async () => {
    const newTodo: NewTodo = {
      name: 'Write essay',
      text: '',
    };

    await expect(() => app.createTask(newTodo)).rejects.toThrow(
      '"text" is empty.'
    );

    const tasks = await app.getTasks();

    expect(tasks).toEqual([]);
  });

  let essayTaskId = '';

  it('should create essay task with incorrect name', async () => {
    const newTodo: NewTodo = {
      name: 'Write essy',
      text: 'Essay size is about 5000 chars without spaces',
    };

    const taskCreated = await app.createTask(newTodo);
    essayTaskId = taskCreated.id;
    const taskFromRepository = await app.getTask(essayTaskId);

    expect(taskFromRepository).not.toBeNull();
    expect(taskCreated.status).toEqual<TodoStatus>('new');
    expect(taskFromRepository).toEqual(taskCreated);
  });

  it('should move essay task to work', async () => {
    let task = await app.getTask(essayTaskId);
    expect(task?.status).toEqual('new');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['to-work', 'close']);

    task = await app.invokeCommand(essayTaskId, 'to-work');
    const inProgressTask = await app.getTask(essayTaskId);

    expect(task.status).toEqual<TodoStatus>('in-progress');
    expect(inProgressTask).toEqual(task);
  });

  it('should update essay task name', async () => {
    const task = await app.getTask(essayTaskId);
    if (task === null) {
      throw new Error('Task not found');
    }
    const fixedTodo: Todo = {
      ...task.payload,
      name: 'Write essay',
    };
    const result = await app.updateTask(essayTaskId, fixedTodo);
    const essayTask = await app.getTask(essayTaskId);

    expect(result.payload.name).toEqual('Write essay');
    expect(essayTask?.payload.name).toEqual('Write essay');
  });

  it('should move essay task to work and get error', async () => {
    await expect(() =>
      app.invokeCommand(essayTaskId, 'to-work')
    ).rejects.toThrow(
      new CommandValidationException('to-work', COMMAND_IS_NOT_AVAILABLE)
    );
  });

  it('should hold essay task', async () => {
    let task = await app.getTask(essayTaskId);
    expect(task?.status).toEqual<TodoStatus>('in-progress');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['hold', 'complete']);

    task = await app.invokeCommand(essayTaskId, 'hold');
    const holdingTask = await app.getTask(essayTaskId);

    expect(task.status).toEqual<TodoStatus>('holding');
    expect(holdingTask).toEqual(task);
  });

  it('should move holding task to work', async () => {
    let task = await app.getTask(essayTaskId);
    expect(task?.status).toEqual<TodoStatus>('holding');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['to-work']);

    task = await app.invokeCommand(essayTaskId, 'to-work');
    const inProgressTask = await app.getTask(essayTaskId);

    expect(task.status).toEqual<TodoStatus>('in-progress');
    expect(inProgressTask).toEqual(task);
  });

  let textbookTaskId = '';

  it('should create textbook task', async () => {
    const newTodo: NewTodo = {
      name: 'Read the textbook',
      text: 'Read 20 pages a day',
    };

    const taskCreated = await app.createTask(newTodo);
    textbookTaskId = taskCreated.id;
    const taskFromRepository = await app.getTask(textbookTaskId);

    expect(taskFromRepository).not.toBeNull();
    expect(taskCreated.status).toEqual<TodoStatus>('new');
    expect(taskFromRepository).toEqual(taskCreated);
  });

  it('should close textbook task', async () => {
    let task = await app.getTask(textbookTaskId);
    expect(task?.status).toEqual<TodoStatus>('new');

    const commands = await app.getTaskCommands(textbookTaskId);
    expect(commands).toEqual<TodoCommand[]>(['to-work', 'close']);

    task = await app.invokeCommand(textbookTaskId, 'close');

    expect(task.status).toEqual<TodoStatus>('closed');
  });

  it('should invoke incorrect command for textbook task', async () => {
    const commands = await app.getTaskCommands(textbookTaskId);
    expect(commands).toEqual<TodoCommand[]>([]);

    await expect(() =>
      app.invokeCommand(textbookTaskId, 'to-work')
    ).rejects.toThrow(
      new CommandValidationException('to-work', COMMAND_IS_NOT_AVAILABLE)
    );
  });

  it('should complete essay task', async () => {
    let task = await app.getTask(essayTaskId);
    expect(task?.status).toEqual<TodoStatus>('in-progress');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['hold', 'complete']);

    task = await app.invokeCommand(essayTaskId, 'complete');
    const completedTask = await app.getTask(essayTaskId);

    expect(task.status).toEqual<TodoStatus>('completed');
    expect(completedTask).toEqual(task);
  });

  it('should close essay task', async () => {
    let task = await app.getTask(essayTaskId);
    expect(task?.status).toEqual<TodoStatus>('completed');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['close']);

    task = await app.invokeCommand(essayTaskId, 'close');

    expect(task.status).toEqual<TodoStatus>('closed');
  });

  it('should failed to update essay task', async () => {
    const fixedTodo: Todo = {
      name: '[Failed] Write essay',
      text: '=(',
      workStared: new Date(),
      created: new Date(),
      priority: 'medium',
    };

    await expect(() => app.updateTask(essayTaskId, fixedTodo)).rejects.toThrow(
      updatingIsProhibited('closed')
    );
  });

  it('should failed to read essay task', async () => {
    await expect(() => app.getTask(essayTaskId)).rejects.toThrow(
      readIsProhibited('closed')
    );
  });
});
